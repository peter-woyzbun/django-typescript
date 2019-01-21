from setuptools import setup, find_packages

setup(name='django-typescript',
      version='0.2',
      description='rests',
      author='Peter Woyzbun',
      author_email='peter.woyzbun@gmail.com',
      packages=find_packages(),
      include_package_data=True,
      install_requires=['django>=2.1',
                        'djangorestframework',
                        'jinja2',
                        'pyparsing'
                        ],
      zip_safe=False)