from django.db import models
from django.contrib.auth.models import User

class Author(models.Model):
    name = models.CharField(max_length=255)
    affiliation = models.CharField(max_length=300, blank=True, default='')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Paper(models.Model):
    arxiv_id = models.CharField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=500)
    abstract = models.TextField()
    authors = models.ManyToManyField(Author, related_name='papers', blank=True)
    category = models.CharField(max_length=100, blank=True, default='')
    published_date = models.DateField(null=True, blank=True)
    updated_date = models.DateField(null=True, blank=True)
    journal_ref = models.CharField(max_length=300, blank=True, default='')
    doi = models.CharField(max_length=200, blank=True, default='')
    pdf_url = models.URLField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_date', '-created_at']

    def __str__(self):
        return f"[{self.arxiv_id}] {self.title[:60]}"

    @property
    def vote_score(self):
        upvotes = self.votes.filter(value=1).count()
        downvotes = self.votes.filter(value=-1).count()
        return upvotes - downvotes

class Summary(models.Model):
    GENERATOR_CHOICES = [
        ('NEMOTRON_LLM', 'NVIDIA Nemotron 3 Ultra'),
        ('NLP_ENGINE', 'Extractive NLP Engine'),
        ('AI_LLM', 'AI Language Model'),
    ]

    paper = models.OneToOneField(Paper, on_delete=models.CASCADE, related_name='summary')
    executive_summary = models.TextField(help_text="Concise high-level overview of the problem and proposed solution")
    key_findings = models.JSONField(default=list, help_text="List of bullet points detailing main results")
    methodology = models.TextField(blank=True, default='', help_text="Core technical approach or architectural methods")
    lay_summary = models.TextField(blank=True, default='', help_text="Plain language explanation for non-specialists")
    limitations = models.TextField(blank=True, default='', help_text="Known constraints or areas for future research")
    keywords = models.JSONField(default=list, help_text="Key scientific themes and taxonomy")
    generator_type = models.CharField(max_length=20, choices=GENERATOR_CHOICES, default='NLP_ENGINE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Summaries'

    def __str__(self):
        return f"Summary for {self.paper.arxiv_id}"

class Collection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collections')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class CollectionItem(models.Model):
    STATUS_CHOICES = [
        ('to_read', 'To Read'),
        ('reading', 'Reading'),
        ('completed', 'Completed'),
    ]

    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name='items')
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, related_name='collection_entries')
    notes = models.TextField(blank=True, default='')
    reading_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='to_read')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-added_at']
        unique_together = ('collection', 'paper')

    def __str__(self):
        return f"{self.paper.arxiv_id} in {self.collection.name}"

class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, related_name='votes')
    value = models.SmallIntegerField(choices=[(1, 'Upvote'), (-1, 'Downvote')])
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'paper')

    def __str__(self):
        return f"{self.user.username} voted {self.value} on {self.paper.arxiv_id}"

class ReadingHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='history')
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, related_name='history_views')
    visited_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-visited_at']
        unique_together = ('user', 'paper')

    def __str__(self):
        return f"{self.user.username} viewed {self.paper.arxiv_id}"

