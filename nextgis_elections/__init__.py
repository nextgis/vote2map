from pyramid.config import Configurator

from sqlalchemy import engine_from_config

from nextgis_elections.models import initialize_sql

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    initialize_sql(engine)
    config = Configurator(settings=settings)
    config.add_static_view('static', 'nextgis_elections:static', cache_max_age=3600)

    config.add_route('home', '/')
    config.add_view('nextgis_elections.views.home', route_name='home', renderer='index.mako')

    config.add_route('setup_js', '/setup_js')
    config.add_view('nextgis_elections.views.setup_js', route_name='setup_js', renderer='setup_js.mako')

    config.add_route('data', '/data')
    config.add_view('nextgis_elections.views.data', route_name='data')


    # config.add_route('home', '/')
    # config.add_view('nextgis_elections.views.my_view',
    #                 route_name='home',
    #                 renderer='templates/mytemplate.pt')
    return config.make_wsgi_app()
