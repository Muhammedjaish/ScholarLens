from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Author, Paper, Summary, Collection, CollectionItem, Vote, ReadingHistory
from .serializers import (
    PaperListSerializer, PaperDetailSerializer, SummarySerializer,
    CollectionSerializer, CollectionItemSerializer, ReadingHistorySerializer
)
from .services import ArxivService, AcademicSummarizationEngine

def get_or_create_paper_from_arxiv(arxiv_id: str) -> Paper:
    """Helper to fetch from arXiv and persist locally if not already present."""
    clean_id = ArxivService.clean_id(arxiv_id)
    paper = Paper.objects.filter(arxiv_id=clean_id).first()
    if paper:
        return paper

    # Query arXiv API
    data = ArxivService.fetch_paper_by_id(clean_id)
    if not data:
        return None

    paper = Paper.objects.create(
        arxiv_id=data['arxiv_id'],
        title=data['title'],
        abstract=data['abstract'],
        category=data['category'],
        published_date=data['published_date'],
        updated_date=data['updated_date'],
        journal_ref=data['journal_ref'],
        doi=data['doi'],
        pdf_url=data['pdf_url'],
    )

    # Attach authors
    for author_info in data['authors']:
        author_obj, _ = Author.objects.get_or_create(
            name=author_info['name'],
            defaults={'affiliation': author_info.get('affiliation', '')}
        )
        paper.authors.add(author_obj)

    return paper


class PaperSearchView(APIView):
    """
    Search papers across local database and arXiv API.
    Accepts query param ?q=... and optional ?source=all|local|arxiv
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            # Return recently published papers from local database
            recent = Paper.objects.all().order_by('-published_date', '-created_at')[:12]
            serializer = PaperListSerializer(recent, many=True)
            return Response({
                'success': True,
                'count': recent.count(),
                'results': serializer.data,
                'source': 'local_recent'
            })

        # Check if query matches an arXiv ID directly
        clean_id = ArxivService.clean_id(query)
        if '.' in clean_id or '/' in clean_id:
            paper = get_or_create_paper_from_arxiv(clean_id)
            if paper:
                serializer = PaperListSerializer([paper], many=True)
                return Response({
                    'success': True,
                    'count': 1,
                    'results': serializer.data,
                    'source': 'arxiv_direct'
                })

        # Search arXiv API for fresh results
        arxiv_results = ArxivService.search_papers(query, max_results=10)
        saved_papers = []

        for item in arxiv_results:
            paper, created = Paper.objects.get_or_create(
                arxiv_id=item['arxiv_id'],
                defaults={
                    'title': item['title'],
                    'abstract': item['abstract'],
                    'category': item['category'],
                    'published_date': item['published_date'],
                    'updated_date': item['updated_date'],
                    'journal_ref': item['journal_ref'],
                    'doi': item['doi'],
                    'pdf_url': item['pdf_url'],
                }
            )
            if created:
                for a_info in item['authors']:
                    author_obj, _ = Author.objects.get_or_create(name=a_info['name'])
                    paper.authors.add(author_obj)

            saved_papers.append(paper)

        # Fallback to local DB search if arXiv network returned empty
        if not saved_papers:
            local_matches = Paper.objects.filter(
                Q(title__icontains=query) |
                Q(abstract__icontains=query) |
                Q(arxiv_id__icontains=query) |
                Q(authors__name__icontains=query)
            ).distinct()[:10]
            saved_papers = list(local_matches)

        serializer = PaperListSerializer(saved_papers, many=True)
        return Response({
            'success': True,
            'count': len(saved_papers),
            'results': serializer.data,
            'source': 'arxiv_query' if arxiv_results else 'local_match'
        })


class PaperDetailView(APIView):
    """
    Retrieve full paper details. Auto-generates summary if not yet generated.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, arxiv_id):
        clean_id = ArxivService.clean_id(arxiv_id)
        paper = Paper.objects.filter(arxiv_id=clean_id).first()

        if not paper:
            paper = get_or_create_paper_from_arxiv(clean_id)
            if not paper:
                return Response({
                    'success': False,
                    'error': {
                        'status_code': 404,
                        'message': f"Paper with arXiv ID '{clean_id}' was not found on arXiv."
                    }
                }, status=status.HTTP_404_NOT_FOUND)

        # Record view in reading history if authenticated
        if request.user.is_authenticated:
            ReadingHistory.objects.update_or_create(
                user=request.user,
                paper=paper
            )

        serializer = PaperDetailSerializer(paper, context={'request': request})
        return Response({
            'success': True,
            'paper': serializer.data
        })


class PaperSummarizeView(APIView):
    """
    Generate or regenerate structured summary for a given paper.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, arxiv_id):
        clean_id = ArxivService.clean_id(arxiv_id)
        paper = Paper.objects.filter(arxiv_id=clean_id).first()

        if not paper:
            paper = get_or_create_paper_from_arxiv(clean_id)
            if not paper:
                return Response({
                    'success': False,
                    'error': {'status_code': 404, 'message': 'Paper not found.'}
                }, status=status.HTTP_404_NOT_FOUND)

        # Generate summary using hybrid summarizer
        summary_data = AcademicSummarizationEngine.generate_summary(
            title=paper.title,
            abstract=paper.abstract,
            category=paper.category
        )

        summary, _ = Summary.objects.update_or_create(
            paper=paper,
            defaults={
                'executive_summary': summary_data.get('executive_summary', ''),
                'key_findings': summary_data.get('key_findings', []),
                'methodology': summary_data.get('methodology', ''),
                'lay_summary': summary_data.get('lay_summary', ''),
                'limitations': summary_data.get('limitations', ''),
                'keywords': summary_data.get('keywords', []),
                'generator_type': summary_data.get('generator_type', 'NLP_ENGINE'),
            }
        )

        detail_serializer = PaperDetailSerializer(paper, context={'request': request})
        return Response({
            'success': True,
            'message': 'Summary generated successfully.',
            'paper': detail_serializer.data,
            'summary': SummarySerializer(summary).data
        })


class PaperVoteView(APIView):
    """
    Upvote (+1) or downvote (-1) a paper. Toggling the same vote clears it.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, arxiv_id):
        clean_id = ArxivService.clean_id(arxiv_id)
        paper = get_object_or_404(Paper, arxiv_id=clean_id)

        value = request.data.get('value')
        if value not in [1, -1]:
            return Response({
                'success': False,
                'error': {'status_code': 400, 'message': "Vote value must be 1 (upvote) or -1 (downvote)."}
            }, status=status.HTTP_400_BAD_REQUEST)

        existing_vote = Vote.objects.filter(user=request.user, paper=paper).first()

        if existing_vote:
            if existing_vote.value == value:
                # Remove vote if clicked again
                existing_vote.delete()
                current_vote = 0
                message = "Vote removed."
            else:
                existing_vote.value = value
                existing_vote.save()
                current_vote = value
                message = "Vote updated."
        else:
            Vote.objects.create(user=request.user, paper=paper, value=value)
            current_vote = value
            message = "Vote recorded."

        return Response({
            'success': True,
            'message': message,
            'vote_score': paper.vote_score,
            'user_vote': current_vote
        })


class PaperBibtexView(APIView):
    """
    Returns BibTeX citation string for the paper.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, arxiv_id):
        clean_id = ArxivService.clean_id(arxiv_id)
        paper = get_object_or_404(Paper, arxiv_id=clean_id)
        serializer = PaperDetailSerializer(paper)
        bibtex = serializer.get_bibtex(paper)
        return Response({
            'success': True,
            'arxiv_id': clean_id,
            'bibtex': bibtex
        })


class CollectionListCreateView(generics.ListCreateAPIView):
    """
    List user collections or create a new collection.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CollectionSerializer

    def get_queryset(self):
        return Collection.objects.filter(user=self.request.user)


class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific collection.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CollectionSerializer

    def get_queryset(self):
        return Collection.objects.filter(user=self.request.user)


class CollectionItemManageView(APIView):
    """
    Add or remove a paper from a user's collection, or update reading status/notes.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, collection_id):
        collection = get_object_or_404(Collection, id=collection_id, user=request.user)
        paper_id = request.data.get('paper_id')
        arxiv_id = request.data.get('arxiv_id')

        if paper_id:
            paper = get_object_or_404(Paper, id=paper_id)
        elif arxiv_id:
            paper = get_or_create_paper_from_arxiv(arxiv_id)
            if not paper:
                return Response({'success': False, 'message': 'Paper not found.'}, status=404)
        else:
            return Response({'success': False, 'message': 'paper_id or arxiv_id is required.'}, status=400)

        notes = request.data.get('notes', '')
        reading_status = request.data.get('reading_status', 'to_read')

        item, created = CollectionItem.objects.update_or_create(
            collection=collection,
            paper=paper,
            defaults={'notes': notes, 'reading_status': reading_status}
        )

        return Response({
            'success': True,
            'message': 'Paper added to collection.' if created else 'Collection item updated.',
            'item': CollectionItemSerializer(item).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, collection_id):
        collection = get_object_or_404(Collection, id=collection_id, user=request.user)
        paper_id = request.data.get('paper_id')

        if not paper_id:
            return Response({'success': False, 'message': 'paper_id is required.'}, status=400)

        item = CollectionItem.objects.filter(collection=collection, paper_id=paper_id).first()
        if item:
            item.delete()
            return Response({'success': True, 'message': 'Paper removed from collection.'})
        return Response({'success': False, 'message': 'Paper not in collection.'}, status=404)


class UserHistoryListView(APIView):
    """
    List papers viewed by the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        history = ReadingHistory.objects.filter(user=request.user).select_related('paper')[:20]
        serializer = ReadingHistorySerializer(history, many=True)
        return Response({
            'success': True,
            'results': serializer.data
        })

