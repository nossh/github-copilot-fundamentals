"""
Pytest configuration and fixtures for FastAPI application testing.
"""

import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

@pytest.fixture
def test_client():
    """
    Create a test client for making HTTP requests to the FastAPI app.
    The client will use a clean instance of the activities data for each test.
    """
    return TestClient(app)

@pytest.fixture
def test_activities():
    """
    Provide a clean copy of test activities data for each test.
    This ensures tests don't interfere with each other by modifying shared state.
    """
    # Create a copy of the original activities for testing
    test_data = {
        "Test Club": {
            "description": "A test activity for automated testing",
            "schedule": "Mondays, 3:00 PM - 4:00 PM",
            "max_participants": 10,
            "participants": ["test1@mergington.edu", "test2@mergington.edu"]
        }
    }
    
    # Store the original activities
    original_activities = activities.copy()
    
    # Replace with test data
    activities.clear()
    activities.update(test_data)
    
    yield activities
    
    # Restore original data after test
    activities.clear()
    activities.update(original_activities)