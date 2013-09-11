# -*- coding: utf-8 -*-
import sys 

import csv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from vote2map.models import Unit, Protocol, ProtocolVote

conn = sys.argv[1]
engine = create_engine(conn, echo=False)
dbsession = sessionmaker(bind=engine)()

with open(sys.argv[2], 'r') as csv_file:
    f = csv.reader(csv_file, delimiter=',', quotechar='"')
    head = f.next()


    fieldmap = (
        (1, "Число погашенных неиспользованных открепительных удостоверений", 'a_canceled'),
        (2, "Число открепительных удостоверений, полученных участковой избирательной комиссией", 'a_count'),
        (3, "Число открепительных удостоверений, выданных избирателям на избирательном участке", 'a_issued_l'),
        (4, "Число открепительных удостоверений, выданных избирателям территориальной избирательной комиссией", 'a_issued_t'),
        (5, "Число утраченных открепительных удостоверений", 'a_stolen'),
        (6, "Число погашенных избирательных бюллетеней", 'b_canceled'),
        (7, "Число избирательных бюллетеней, полученных участковой избирательной комиссией", 'b_count'),
        (8, "Число избирательных бюллетеней, выданных избирателям, проголосовавшим досрочно", 'b_early'),
        (9, "Число избирательных бюллетеней в стационарных ящиках для голосования", 'b_fixed'),
        (10, "Число избирательных бюллетеней, выданных избирателям в помещении для голосования", 'b_inside'),
        (11, "Число недействительных избирательных бюллетеней", 'b_invalid'),
        (12, "Число избирательных бюллетеней, выданных избирателям вне помещения для голосования", 'b_outside'),
        (13, "Число избирательных бюллетеней в переносных ящиках для голосования", 'b_portable'),
        (14, "Число утраченных избирательных бюллетеней", 'b_stolen'),
        (15, "Число действительных избирательных бюллетеней", 'b_valid'),
        (16, "Число избирательных бюллетеней, не учтенных при получении", 'b_wtf'),
        (17, "Число избирателей, проголосовавших по открепительным удостоверениям на избирательном участке", 'v_abs'),
        (18, "Число избирателей, внесенных в список избирателей", 'v_count')
    )

    votemap = (
        (19, "Кандидат 1", 1),
        (20, "Кандидат 2", 2),
        (21, "Кандидат 3", 3),
        (22, "Кандидат 4", 4),
        (23, 'Кандидат 5', 5),
        (24, 'Кандидат 6', 6)
    )

    for row in f:
        unit = dbsession.query(Unit).filter_by(id_level4=int(row[0])).one()
        print unit.id_level4
        p = Protocol(source='I', unit_id=unit.id)

        for (idx, name, fld) in fieldmap:
            setattr(p, fld, int('0' if row[idx] == '' else row[idx]))

        dbsession.add(p)

        pvsum = 0.0
        pvs = []
        for (idx, name, fld) in votemap:
            pv = ProtocolVote(source='I', unit_id=unit.id, party_id=fld)
            pv.vote_c = int('0' if row[idx] == '' else row[idx])
            pvsum += pv.vote_c
            pvs.append(pv)

        for pv in pvs:
            if pvsum == 0.0:
                pv.vote_p = 0
            else:
                pv.vote_p = pv.vote_c / pvsum
            dbsession.add(pv)

        if pvsum != p.b_valid:
           print '%d : %d != %d' % (unit.id_level4, pvsum, p.b_valid)

    dbsession.flush()
    dbsession.commit()
