import transaction

from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import BigInteger
from sqlalchemy import Float
from sqlalchemy import Unicode
from sqlalchemy import and_

from geoalchemy import GeometryColumn
from geoalchemy import GeometryDDL
from geoalchemy import Point
from geoalchemy import MultiPolygon

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import relation, backref

from zope.sqlalchemy import ZopeTransactionExtension

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()

class UnitPolygon: pass

class Unit(Base):
    __tablename__ = 'unit'
    id = Column(BigInteger, primary_key=True)
    parent_id = Column(BigInteger, ForeignKey('unit.id'))
    id_level1 = Column(Integer)
    id_level2 = Column(Integer)
    id_level3 = Column(Integer)
    id_level4 = Column(Integer)
    level = Column(Integer)
    name = Column(Unicode)
    url = Column(Unicode)

    parent = relation('Unit', remote_side=[id], uselist=False, backref=backref('child', uselist=True))

    def as_dict(self):
        return dict(id=self.id, name=self.name, level=self.level, parent_id=self.parent_id)

class UnitPolygon(Base):
    __tablename__ = 'unit_polygon'
    unit_id = Column(BigInteger, ForeignKey('unit.id'), primary_key=True)
    geom = GeometryColumn(MultiPolygon(2))

    unit = relation(Unit, uselist=False)

GeometryDDL(UnitPolygon.__table__)

class UnitPoint(Base):
    __tablename__ = 'unit_point'
    unit_id = Column(BigInteger, ForeignKey('unit.id'), primary_key=True)
    geom = GeometryColumn(Point(2))

    unit = relation(Unit, uselist=False)

GeometryDDL(UnitPoint.__table__)

class Party(Base):
    __tablename__ = 'party'
    id = Column(Integer, primary_key=True)
    name = Column(Unicode)
    color = Column(Unicode(6))


class Protocol(Base):
    __tablename__ = 'protocol'
    unit_id = Column(BigInteger, primary_key=True)
    source = Column(Unicode(1), primary_key=True)
    url = Column(Unicode)

    a_canceled = Column(Integer)
    a_count = Column(Integer)
    a_issued_l = Column(Integer)
    a_issued_t = Column(Integer)
    a_stolen = Column(Integer)
    b_canceled = Column(Integer) 
    b_count = Column(Integer) 
    b_early = Column(Integer) 
    b_fixed = Column(Integer) 
    b_inside = Column(Integer) 
    b_invalid = Column(Integer) 
    b_outside = Column(Integer) 
    b_portable = Column(Integer) 
    b_stolen = Column(Integer) 
    b_valid = Column(Integer) 
    b_wtf = Column(Integer)
    v_abs = Column(Integer) 
    v_count = Column(Integer)

    def as_dict(self):
        fields = ("a_canceled", "a_count", "a_issued_l", "a_issued_t", "a_stolen",
                  "b_canceled", "b_count", "b_early", "b_fixed", "b_inside",
                  "b_invalid", "b_outside", "b_portable", "b_stolen", "b_valid",
                  "b_wtf", "v_abs", "v_count")
        result = dict(vote_c={}, vote_p={})
        for f in fields: result[f] = getattr(self, f)

        for v in self.vote:
            result['vote_c'][v.party_id] = v.vote_c
            result['vote_p'][v.party_id] = v.vote_p

        return result

class ProtocolVote(Base):
    __tablename__ = 'protocol_vote'
    unit_id = Column(BigInteger, primary_key=True)
    source = Column(Unicode(1), primary_key=True)
    party_id = Column(Integer, primary_key=True)
    vote_c = Column(Integer)
    vote_p = Column(Float)

Protocol.vote = relation(ProtocolVote,
    primaryjoin=and_(Protocol.unit_id == ProtocolVote.unit_id, Protocol.source == ProtocolVote.source),
    foreign_keys=(ProtocolVote.unit_id, ProtocolVote.source),
    uselist=True,
    lazy='joined')

Unit.protocol_o = relation(Protocol,
    primaryjoin=and_(Unit.id == Protocol.unit_id, Protocol.source == 'O'),
    foreign_keys=(Protocol.unit_id, ),
    uselist=False)

Unit.protocol_i = relation(Protocol,
    primaryjoin=and_(Unit.id == Protocol.unit_id, Protocol.source == 'I'),
    foreign_keys=(Protocol.unit_id, ),
    uselist=False)


def populate():
    pass

def initialize_sql(engine):
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    Base.metadata.create_all(engine)
    try:
        populate()
    except IntegrityError:
        transaction.abort()
