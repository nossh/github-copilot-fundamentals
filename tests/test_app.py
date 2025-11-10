"""
Test suite for the FastAPI application endpoints.
"""

import pytest
from fastapi import HTTPException

def test_root_redirects(test_client):
    """Test that the root endpoint redirects to the static index.html"""
    response = test_client.get("/", follow_redirects=True)
    assert response.status_code == 200
    assert str(response.url).endswith("/static/index.html")

def test_get_activities(test_client, test_activities):
    """Test retrieving the list of activities"""
    response = test_client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Test Club" in data
    assert data["Test Club"]["max_participants"] == 10
    assert len(data["Test Club"]["participants"]) == 2

def test_signup_success(test_client, test_activities):
    """Test successful signup for an activity"""
    activity_name = "Test Club"
    email = "new@mergington.edu"
    
    response = test_client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity_name}"
    
    # Verify participant was added
    assert email in test_activities[activity_name]["participants"]

def test_signup_duplicate(test_client, test_activities):
    """Test signup fails when student is already registered"""
    activity_name = "Test Club"
    email = "test1@mergington.edu"  # Already in test data
    
    response = test_client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_nonexistent_activity(test_client):
    """Test signup fails for non-existent activity"""
    activity_name = "Nonexistent Club"
    email = "new@mergington.edu"
    
    response = test_client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_unregister_success(test_client, test_activities):
    """Test successful unregistration from an activity"""
    activity_name = "Test Club"
    email = "test1@mergington.edu"  # In test data
    
    response = test_client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 200
    assert response.json()["message"] == f"Unregistered {email} from {activity_name}"
    
    # Verify participant was removed
    assert email not in test_activities[activity_name]["participants"]

def test_unregister_not_registered(test_client, test_activities):
    """Test unregister fails when student is not registered"""
    activity_name = "Test Club"
    email = "notregistered@mergington.edu"
    
    response = test_client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 400
    assert "not registered" in response.json()["detail"]

def test_unregister_nonexistent_activity(test_client):
    """Test unregister fails for non-existent activity"""
    activity_name = "Nonexistent Club"
    email = "test@mergington.edu"
    
    response = test_client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]