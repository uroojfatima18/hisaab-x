"""
Simple test script to verify FastAPI backend functionality
"""
import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000/api"

async def test_fastapi_backend():
    print("Testing FastAPI Backend...")

    async with httpx.AsyncClient() as client:
        # Test health endpoint
        print("\n1. Testing health endpoint...")
        try:
            response = await client.get(f"{BASE_URL.replace('/api', '')}/health")
            print(f"Health check: {response.status_code} - {response.json()}")
        except Exception as e:
            print(f"Health check failed: {e}")

        # Test signup
        print("\n2. Testing signup...")
        signup_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123"
        }
        try:
            response = await client.post(f"{BASE_URL}/auth/signup", json=signup_data)
            print(f"Signup: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"Signup successful: {result['user']['username']}")
                token = result.get('access_token')
                if token:
                    print("Token received")
                    headers = {"Authorization": f"Bearer {token}"}

                    # Test get current user with token
                    print("\n3. Testing get current user...")
                    response = await client.get(f"{BASE_URL}/auth/me", headers=headers)
                    print(f"Get current user: {response.status_code}")
                    if response.status_code == 200:
                        user_data = response.json()
                        print(f"Current user: {user_data['user']['username']}")

                    # Test settings
                    print("\n4. Testing settings...")
                    response = await client.get(f"{BASE_URL}/settings", headers=headers)
                    print(f"Get settings: {response.status_code}")

                    # Test transactions
                    print("\n5. Testing transactions...")
                    response = await client.get(f"{BASE_URL}/transactions", headers=headers)
                    print(f"Get transactions: {response.status_code}")

                    # Test budgets
                    print("\n6. Testing budgets...")
                    response = await client.get(f"{BASE_URL}/budgets", headers=headers)
                    print(f"Get budgets: {response.status_code}")

        except Exception as e:
            print(f"Signup or subsequent tests failed: {e}")

    print("\nTest completed!")

if __name__ == "__main__":
    asyncio.run(test_fastapi_backend())