# -*- coding: utf-8 -*-
import re 

from pyramid.response import Response

from sqlalchemy.orm import aliased
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from sqlalchemy.sql.expression import distinct

from shapely.wkt import loads as loads_wkt
from geojson import FeatureCollection, Feature, dumps as dumps_geojson

from nextgis_elections.models import DBSession
from nextgis_elections.models import Unit
from nextgis_elections.models import UnitPolygon
from nextgis_elections.models import UnitPoint
from nextgis_elections.models import Party

def home(request):
    dbsession = DBSession()

    return dict(parties=dbsession.query(Party).order_by(Party.id).all())

def setup_js(request):
    dbsession = DBSession()

    return dict(parties=dbsession.query(Party).order_by(Party.id).all())


def data(request):

    dbsession = DBSession()

    geom = request.params['geom'] if 'geom' in request.params else 'polygon'
    srs = int(request.params['srs']) if 'srs' in request.params else 4326
    root = int(request.params['root']) if 'root' in request.params else None
    depth = int(request.params['depth']) if 'depth' in request.params else 1
    level = int(request.params['level']) if 'level' in request.params else None


    filter = []

    # отбор по иерархии
    p_coalesce = []
    t_child = []
    for l in range(depth):
        t_tab = aliased(Unit)
        p_coalesce.insert(0, t_tab.id)
        t_child.append(t_tab)

    q_child = dbsession.query(distinct(func.coalesce(*p_coalesce)).label('child_id')) \
        .filter(t_child[0].parent_id == root)

    for l in range(depth):
        if l == 0: pass
        else: q_child = q_child.join((t_child[l], t_child[l - 1].child))

    child_id = [r.child_id for r in q_child.all()] 

    # геометрия
    if geom == 'polygon':
        t_geom = UnitPolygon
    elif geom == 'point':
        t_geom = UnitPoint
    
    e_geom = func.st_astext(func.st_transform(func.st_setsrid(t_geom.geom, 4326), srs))

    q_unit = dbsession.query(Unit, e_geom.label('geom')).options(joinedload(Unit.protocol_o), joinedload(Unit.protocol_i)).filter(Unit.id.in_(child_id)) \
        .outerjoin((t_geom, t_geom.unit_id == Unit.id))

    print q_unit

    if level:
        q_unit = q_unit.filter(Unit.level == level)

    features = []

    for record in q_unit.all():
        properties = dict(protocol_o=record.Unit.protocol_o.as_dict() if record.Unit.protocol_o else None,
                          protocol_i=record.Unit.protocol_i.as_dict() if record.Unit.protocol_i else None,
                          unit=record.Unit.as_dict())
        features.append(Feature(id=record.Unit.id, geometry=loads_wkt(record.geom) if record.geom else None, properties=properties))

    fcoll = dumps_geojson(FeatureCollection(features))
    if 'callback' in request.params:
        return Response('%s(%s)' % (request.params['callback'], fcoll), content_type="text/javascript")
    else:
        return Response(fcoll, content_type="application/json")

          
def unit_search(request):
    
    q = request.params['term']
    srs = int(request.params['srs']) if 'srs' in request.params else 4326
      
    dbsession = DBSession()

    fields = (
        Unit,
        func.st_xmin(func.st_transform(func.st_setsrid(UnitPolygon.geom, 4326), srs)).label('left'),
        func.st_xmax(func.st_transform(func.st_setsrid(UnitPolygon.geom, 4326), srs)).label('right'),
        func.st_ymin(func.st_transform(func.st_setsrid(UnitPolygon.geom, 4326), srs)).label('bottom'),
        func.st_ymax(func.st_transform(func.st_setsrid(UnitPolygon.geom, 4326), srs)).label('top'),
        func.st_x(func.st_transform(func.st_setsrid(UnitPoint.geom, 4326), srs)).label('x'),
        func.st_y(func.st_transform(func.st_setsrid(UnitPoint.geom, 4326), srs)).label('y'),

    )

    if re.match('\d+', q):
        result = dbsession.query(*fields).filter_by(id_level4=int(q)) \
            .outerjoin((UnitPolygon, UnitPolygon.unit_id == Unit.id)) \
            .outerjoin((UnitPoint, UnitPoint.unit_id == Unit.id)) \
            .all()
    else:
        result = dbsession.query(*fields) \
            .outerjoin((UnitPolygon, UnitPolygon.unit_id == Unit.id)) \
            .outerjoin((UnitPoint, UnitPoint.unit_id == Unit.id)) \
            .filter("unit.search_vector @@ plainto_tsquery('russian', :tsquery)") \
            .params(tsquery=q).limit(10)

    rows = []
    for r in result:
        itm = r.Unit.as_dict()
        itm['value'] = r.Unit.name

        if r.left and r.top:
            itm['extent'] = (r.left, r.bottom, r.right, r.top)

        if r.x and r.y:
            itm['x'] = r.x
            itm['y'] = r.y

        rows.append(itm)

    return rows

        

