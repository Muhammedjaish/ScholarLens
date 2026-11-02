"""
Centralized exception handling for Django REST Framework.
Standardizes error response structures across the API.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Returns consistent, structured JSON responses:
    {
        "success": false,
        "error": {
            "code": "permission_denied",
            "message": "...",
            "details": {...}
        }
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'success': False,
            'error': {
                'status_code': response.status_code,
                'message': 'An error occurred while processing your request.',
                'details': response.data
            }
        }
        
        # Format friendly message if available
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_data['error']['message'] = str(response.data['detail'])
            elif 'non_field_errors' in response.data:
                custom_data['error']['message'] = ' '.join(response.data['non_field_errors'])
        elif isinstance(response.data, list) and len(response.data) > 0:
            custom_data['error']['message'] = str(response.data[0])

        response.data = custom_data
        return response

    # Handle unhandled server exceptions (500)
    logger.exception(f"Unhandled exception in API context: {context}")
    return Response(
        {
            'success': False,
            'error': {
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An unexpected internal server error occurred.',
                'details': str(exc) if context.get('request') and context['request'].user.is_staff else None
            }
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

