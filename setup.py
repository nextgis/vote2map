import os
import sys

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid',
    'SQLAlchemy',
    'psycopg2',
    'transaction',
    'pyramid_tm',
    'pyramid_debugtoolbar',
    'zope.sqlalchemy',
    'geoalchemy',
    'geojson',
    'shapely'
    ]

if sys.version_info[:3] < (2,5,0):
    requires.append('pysqlite')

setup(name='nextgis_elections',
      version='0.0',
      description='nextgis_elections',
      long_description=README + '\n\n' +  CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='',
      author_email='',
      url='',
      keywords='web wsgi bfg pylons pyramid',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      test_suite='nextgis_elections',
      install_requires = requires,
      entry_points = """\
      [paste.app_factory]
      main = nextgis_elections:main
      """,
      paster_plugins=['pyramid'],
      )

