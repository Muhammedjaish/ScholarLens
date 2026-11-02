from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from papers.models import Author, Paper, Summary, Collection, CollectionItem
from papers.services import AcademicSummarizationEngine

class Command(BaseCommand):
    help = 'Seeds database with initial academic papers, structured summaries, and demo users'

    def handle(self, *args, **options):
        self.stdout.write("Seeding academic papers and demo data...")

        # 1. Create Demo Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@academicportal.edu',
                'first_name': 'System',
                'last_name': 'Administrator',
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin_user.set_password('AdminPass123!')
        admin_user.save()

        researcher, _ = User.objects.get_or_create(
            username='researcher',
            defaults={
                'email': 'researcher@academicportal.edu',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'is_staff': False
            }
        )
        researcher.set_password('ResearcherPass123!')
        researcher.save()
        researcher.profile.institution = 'Stanford Institute for Human-Centered AI'
        researcher.profile.field_of_study = 'Computer Science / NLP'
        researcher.profile.bio = 'Doctoral candidate researching efficient attention mechanisms and foundation models.'
        researcher.profile.save()

        # 2. Seed Seminal Papers
        papers_data = [
            {
                'arxiv_id': '1706.03762',
                'title': 'Attention Is All You Need',
                'abstract': (
                    'The dominant sequence transduction models are based on complex recurrent or convolutional '
                    'neural networks that include an encoder and a decoder. The best performing models also connect '
                    'the encoder and decoder through an attention mechanism. We propose a new simple network architecture, '
                    'the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. '
                    'Experiments on two machine translation tasks show these models to be superior in quality while being '
                    'more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the '
                    'WMT 2014 English-to-German translation task, improving over the existing best results by over 2 BLEU.'
                ),
                'category': 'cs.CL',
                'published_date': '2017-06-12',
                'pdf_url': 'https://arxiv.org/pdf/1706.03762.pdf',
                'authors': [
                    {'name': 'Ashish Vaswani', 'affiliation': 'Google Brain'},
                    {'name': 'Noam Shazeer', 'affiliation': 'Google Brain'},
                    {'name': 'Niki Parmar', 'affiliation': 'Google Research'},
                    {'name': 'Jakob Uszkoreit', 'affiliation': 'Google Research'},
                    {'name': 'Llion Jones', 'affiliation': 'Google Research'},
                    {'name': 'Aidan N. Gomez', 'affiliation': 'University of Toronto'},
                    {'name': 'Łukasz Kaiser', 'affiliation': 'Google Brain'},
                    {'name': 'Illia Polosukhin', 'affiliation': ''}
                ]
            },
            {
                'arxiv_id': '1512.03385',
                'title': 'Deep Residual Learning for Image Recognition',
                'abstract': (
                    'Deeper neural networks are more difficult to train. We present a residual learning framework to '
                    'ease the training of networks that are substantially deeper than those used previously. We explicitly '
                    'reformulate the layers as learning residual functions with reference to the layer inputs, instead of '
                    'learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual '
                    'networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet '
                    'dataset we evaluate residual nets with a depth of up to 152 layers---8x deeper than VGG nets but still having '
                    'lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. '
                    'This result won the 1st place on the ILSVRC 2015 classification task.'
                ),
                'category': 'cs.CV',
                'published_date': '2015-12-10',
                'pdf_url': 'https://arxiv.org/pdf/1512.03385.pdf',
                'authors': [
                    {'name': 'Kaiming He', 'affiliation': 'Microsoft Research'},
                    {'name': 'Xiangyu Zhang', 'affiliation': 'Xi\'an Jiaotong University'},
                    {'name': 'Shaoqing Ren', 'affiliation': 'University of Science and Technology of China'},
                    {'name': 'Jian Sun', 'affiliation': 'Microsoft Research'}
                ]
            },
            {
                'arxiv_id': '1810.04805',
                'title': 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
                'abstract': (
                    'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder '
                    'Representations from Transformers. Unlike recent language representation models, BERT is designed to '
                    'pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left '
                    'and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one '
                    'additional output layer to create state-of-the-art models for a wide range of tasks, such as question '
                    'answering and language inference, without substantial task-specific architecture modifications. BERT is '
                    'conceptually simple and empirically powerful. It obtains new state-of-the-art results on eleven natural '
                    'language processing tasks, including pushing the GLUE score to 80.5% (7.7% point absolute improvement).'
                ),
                'category': 'cs.CL',
                'published_date': '2018-10-11',
                'pdf_url': 'https://arxiv.org/pdf/1810.04805.pdf',
                'authors': [
                    {'name': 'Jacob Devlin', 'affiliation': 'Google AI Language'},
                    {'name': 'Ming-Wei Chang', 'affiliation': 'Google AI Language'},
                    {'name': 'Kenton Lee', 'affiliation': 'Google AI Language'},
                    {'name': 'Kristina Toutanova', 'affiliation': 'Google AI Language'}
                ]
            }
        ]

        seeded_papers = []
        for p_data in papers_data:
            authors_info = p_data.pop('authors')
            paper, _ = Paper.objects.update_or_create(
                arxiv_id=p_data['arxiv_id'],
                defaults=p_data
            )
            for a_info in authors_info:
                author_obj, _ = Author.objects.get_or_create(
                    name=a_info['name'],
                    defaults={'affiliation': a_info.get('affiliation', '')}
                )
                paper.authors.add(author_obj)

            # Auto-generate rich summary
            summary_data = AcademicSummarizationEngine.generate_summary(
                title=paper.title,
                abstract=paper.abstract,
                category=paper.category
            )
            Summary.objects.update_or_create(
                paper=paper,
                defaults={
                    'executive_summary': summary_data['executive_summary'],
                    'key_findings': summary_data['key_findings'],
                    'methodology': summary_data['methodology'],
                    'lay_summary': summary_data['lay_summary'],
                    'limitations': summary_data['limitations'],
                    'keywords': summary_data['keywords'],
                    'generator_type': summary_data['generator_type'],
                }
            )
            seeded_papers.append(paper)
            self.stdout.write(f"  + Seeded paper: {paper.arxiv_id} - {paper.title}")

        # 3. Create Sample Collection for researcher
        col, _ = Collection.objects.get_or_create(
            user=researcher,
            name='Foundation NLP Architectures',
            defaults={
                'description': 'Seminal literature on sequence modeling and self-attention paradigms.',
                'is_public': True
            }
        )
        for idx, paper in enumerate(seeded_papers):
            CollectionItem.objects.get_or_create(
                collection=col,
                paper=paper,
                defaults={
                    'reading_status': 'completed' if idx == 0 else 'reading',
                    'notes': 'Fundamental reference for background and methodology section.'
                }
            )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
        self.stdout.write("Credentials created:")
        self.stdout.write("  Admin: username='admin', password='AdminPass123!'")
        self.stdout.write("  Researcher: username='researcher', password='ResearcherPass123!'")

