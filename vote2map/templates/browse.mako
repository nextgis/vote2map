<!DOCTYPE html>
<html>
<head>

    <title>Карта выборов мэра Москвы (2013)</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">

    <style type="text/css">
        body {
            font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;
            font-size: small;
            background-color: #FFFFFF;
        }

        th {
            background-color: #eee;
        }
    </style>

</head>
<body>
    <table>
        <tr>
            <th>УИК</th>
            <th>Данные ЦИК</th>
            <th>Копии протоколов</th>
            <th>Разница</th>
        </tr>
        %for unit, stat in units:
            <tr>
                <td><a href="${request.route_url('home')}?uik=${unit.id_level4}">${unit.name}</td>
                <td>${u"+" if stat.official else ''}</td>
                <td>${u"+" if stat.independent else ''}</td>
                <td>${stat.diff_value if stat.diff else ''}</td>
            </tr>
        %endfor
    </table>
</body>
</html>