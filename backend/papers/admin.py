from django.contrib import admin
from .models import Author, Paper, Summary, Collection, CollectionItem, Vote, ReadingHistory

class SummaryInline(admin.StackedInline):
    model = Summary
    extra = 0
    can_delete = True

@admin.register(Paper)
class PaperAdmin(admin.ModelAdmin):
    list_display = ('arxiv_id', 'title', 'category', 'published_date', 'vote_score', 'created_at')
    search_fields = ('arxiv_id', 'title', 'abstract', 'category')
    list_filter = ('category', 'published_date')
    inlines = [SummaryInline]
    filter_horizontal = ('authors',)

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name', 'affiliation')
    search_fields = ('name', 'affiliation')

@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ('paper', 'generator_type', 'created_at', 'updated_at')
    list_filter = ('generator_type', 'created_at')
    search_fields = ('paper__title', 'paper__arxiv_id', 'executive_summary')

class CollectionItemInline(admin.TabularInline):
    model = CollectionItem
    extra = 1

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_public', 'created_at', 'updated_at')
    search_fields = ('name', 'user__username', 'description')
    list_filter = ('is_public', 'created_at')
    inlines = [CollectionItemInline]

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'paper', 'value', 'created_at')
    list_filter = ('value', 'created_at')
    search_fields = ('user__username', 'paper__title', 'paper__arxiv_id')

@admin.register(ReadingHistory)
class ReadingHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'paper', 'visited_at')
    search_fields = ('user__username', 'paper__title', 'paper__arxiv_id')

