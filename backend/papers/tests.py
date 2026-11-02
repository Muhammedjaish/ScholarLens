from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Author, Paper, Summary, Collection, CollectionItem
from .services import AcademicSummarizationEngine, ArxivService

class PaperModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testresearcher', password='Password123!')
        self.client = APIClient()
        self.author = Author.objects.create(name='Ashish Vaswani', affiliation='Google Brain')
        self.paper = Paper.objects.create(
            arxiv_id='1706.03762',
            title='Attention Is All You Need',
            abstract='The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture eschewing recurrence and relying entirely on an attention mechanism.',
            category='cs.CL',
            pdf_url='https://arxiv.org/pdf/1706.03762.pdf'
        )
        self.paper.authors.add(self.author)

    def test_paper_creation(self):
        self.assertEqual(self.paper.arxiv_id, '1706.03762')
        self.assertEqual(self.paper.authors.count(), 1)
        self.assertEqual(self.paper.vote_score, 0)

    def test_academic_summarization_engine(self):
        summary = AcademicSummarizationEngine.generate_summary(
            title=self.paper.title,
            abstract=self.paper.abstract,
            category=self.paper.category
        )
        self.assertIn('executive_summary', summary)
        self.assertIn('key_findings', summary)
        self.assertIn('methodology', summary)
        self.assertIn('lay_summary', summary)
        self.assertIn('limitations', summary)
        self.assertIn('keywords', summary)
        self.assertGreater(len(summary['key_findings']), 0)

    def test_paper_detail_api(self):
        response = self.client.get(f'/api/papers/{self.paper.arxiv_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['paper']['title'], 'Attention Is All You Need')

    def test_paper_summarize_api(self):
        response = self.client.post(f'/api/papers/{self.paper.arxiv_id}/summarize/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('summary', response.data)
        self.assertEqual(Summary.objects.filter(paper=self.paper).count(), 1)

    def test_collection_flow(self):
        self.client.force_authenticate(user=self.user)
        # Create collection
        col_res = self.client.post('/api/collections/', {
            'name': 'Deep Learning Milestones',
            'description': 'Seminal neural network architectures',
            'is_public': True
        })
        self.assertEqual(col_res.status_code, status.HTTP_201_CREATED)
        col_id = col_res.data['id']

        # Add paper to collection
        item_res = self.client.post(f'/api/collections/{col_id}/items/', {
            'paper_id': self.paper.id,
            'reading_status': 'reading',
            'notes': 'Must cite in section 3 of literature review'
        })
        self.assertEqual(item_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CollectionItem.objects.filter(collection_id=col_id).count(), 1)

