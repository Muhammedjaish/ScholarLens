from django.urls import path
from .views import (
    PaperSearchView, PaperDetailView, PaperSummarizeView,
    PaperVoteView, PaperBibtexView, CollectionListCreateView,
    CollectionDetailView, CollectionItemManageView, UserHistoryListView
)

urlpatterns = [
    # Paper operations
    path('papers/search/', PaperSearchView.as_view(), name='paper_search'),
    path('papers/<str:arxiv_id>/', PaperDetailView.as_view(), name='paper_detail'),
    path('papers/<str:arxiv_id>/summarize/', PaperSummarizeView.as_view(), name='paper_summarize'),
    path('papers/<str:arxiv_id>/vote/', PaperVoteView.as_view(), name='paper_vote'),
    path('papers/<str:arxiv_id>/bibtex/', PaperBibtexView.as_view(), name='paper_bibtex'),

    # Collections
    path('collections/', CollectionListCreateView.as_view(), name='collection_list_create'),
    path('collections/<int:pk>/', CollectionDetailView.as_view(), name='collection_detail'),
    path('collections/<int:collection_id>/items/', CollectionItemManageView.as_view(), name='collection_item_manage'),

    # User activity
    path('history/', UserHistoryListView.as_view(), name='user_history'),
]

