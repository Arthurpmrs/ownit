from datetime import datetime

from src.features.chat.context import (
    StudentContext,
    format_student_context,
    truncate_context,
)


def test_format_student_context_new_student():
    context = StudentContext(
        name='Ricardo',
        member_since=datetime(2026, 5, 15),
        active_goals=[],
    )
    sections = format_student_context(context)
    assert 'Ricardo' in sections['profile']
    assert 'Nenhuma meta ativa no momento.' in sections['goals']
    assert 'Nenhuma sessão ativa no momento' in sections['upcoming_sessions']


def test_truncate_context_within_budget():
    sections = {
        'profile': 'Profile Data',
        'goals': 'Goals Data',
        'events': 'Events Data',
    }
    # 1000 tokens is enough
    result = truncate_context(sections, 1000)
    assert 'Profile Data' in result
    assert 'Goals Data' in result
    assert 'Events Data' in result


def test_truncate_context_exceeds_budget():
    sections = {
        'profile': 'Profile Data',
        'goals': 'Goals Data',
        'events': 'Very long events data ' * 50,
    }
    # Small budget to force dropping events
    result = truncate_context(sections, 10)
    assert 'Profile Data' in result
    assert 'Goals Data' in result
    assert 'Events Data' not in result
