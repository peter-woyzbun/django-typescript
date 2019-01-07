from setuptools import setup, find_packages

setup(name='django-typescript',
      version='0.1',
      description='rests',
      author='Peter Woyzbun',
      author_email='peter.woyzbun@gmail.com',
      packages=find_packages(),
      include_package_data=True,
      install_requires=['django>=2.1',
                        'djangorestframework',
                        'jinja2',
                        'mypy_extensions',
                        'pyparsing'
                        ],
      zip_safe=False)