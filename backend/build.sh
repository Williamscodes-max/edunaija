#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser if doesn't exist
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@edunaija.com').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@edunaija.com',
        password='Admin1234!'
    )
    print('Superuser created!')
else:
    print('Superuser already exists.')
"