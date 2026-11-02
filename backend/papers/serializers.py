from rest_framework import serializers
from .models import Author, Paper, Summary, Collection, CollectionItem, Vote, ReadingHistory

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'affiliation']

class SummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Summary
        fields = [
            'id', 'executive_summary', 'key_findings', 'methodology',
            'lay_summary', 'limitations', 'keywords', 'generator_type',
            'created_at', 'updated_at'
        ]

class PaperListSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    has_summary = serializers.SerializerMethodField()
    vote_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = Paper
        fields = [
            'id', 'arxiv_id', 'title', 'abstract', 'authors', 'category',
            'published_date', 'vote_score', 'has_summary', 'pdf_url'
        ]

    def get_has_summary(self, obj):
        return hasattr(obj, 'summary')

class PaperDetailSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    summary = SummarySerializer(read_only=True)
    vote_score = serializers.IntegerField(read_only=True)
    user_vote = serializers.SerializerMethodField()
    bibtex = serializers.SerializerMethodField()

    class Meta:
        model = Paper
        fields = [
            'id', 'arxiv_id', 'title', 'abstract', 'authors', 'category',
            'published_date', 'updated_date', 'journal_ref', 'doi',
            'pdf_url', 'vote_score', 'user_vote', 'summary', 'bibtex',
            'created_at', 'updated_at'
        ]

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.votes.filter(user=request.user).first()
            return vote.value if vote else 0
        return 0

    def get_bibtex(self, obj):
        author_names = " and ".join([a.name for a in obj.authors.all()]) or "Unknown Author"
        year = obj.published_date.year if obj.published_date else "Recent"
        clean_key = obj.arxiv_id.replace('.', '_').replace('/', '_')
        return (
            f"@article{{{clean_key},\n"
            f"  author    = {{{author_names}}},\n"
            f"  title     = {{{obj.title}}},\n"
            f"  journal   = {{arXiv preprint arXiv:{obj.arxiv_id}}},\n"
            f"  year      = {{{year}}},\n"
            f"  eprint    = {{{obj.arxiv_id}}},\n"
            f"  archivePrefix = {{arXiv}},\n"
            f"  primaryClass  = {{{obj.category}}}\n"
            f"}}"
        )

class CollectionItemSerializer(serializers.ModelSerializer):
    paper = PaperListSerializer(read_only=True)
    paper_id = serializers.PrimaryKeyRelatedField(
        queryset=Paper.objects.all(), source='paper', write_only=True
    )

    class Meta:
        model = CollectionItem
        fields = ['id', 'paper', 'paper_id', 'notes', 'reading_status', 'added_at']

class CollectionSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    items = CollectionItemSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ['id', 'name', 'description', 'is_public', 'items_count', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_items_count(self, obj):
        return obj.items.count()

    def create(self, validated_data):
        user = self.context['request'].user
        return Collection.objects.create(user=user, **validated_data)

class VoteSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=[1, -1])

class ReadingHistorySerializer(serializers.ModelSerializer):
    paper = PaperListSerializer(read_only=True)

    class Meta:
        model = ReadingHistory
        fields = ['id', 'paper', 'visited_at']

