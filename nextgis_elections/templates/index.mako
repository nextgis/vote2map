<!DOCTYPE html>
<html>
<head>

    <title>Elections map</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">

    <!-- CSS -->
    <link rel="stylesheet" href="${request.static_url('nextgis_elections:static/css/map.css')}" type="text/css">
    <link rel="stylesheet" href="${request.static_url('nextgis_elections:static/jquery/css/smoothness/jquery-ui-1.8.16.custom.css')}" type="text/css">
 
    <!-- jQuery Tools library -->
    <script src="${request.static_url('nextgis_elections:static/jquery/js/jquery-1.6.2.min.js')}"></script>
    <script src="${request.static_url('nextgis_elections:static/jquery/js/jquery-ui-1.8.16.custom.min.js')}"></script>
    <script src="${request.static_url('nextgis_elections:static/jquery/js/jquery.tools.min.js')}"></script>

    <!-- OpenLayers library -->
    <script src="${request.static_url('nextgis_elections:static/openlayers/OpenLayers.js')}"></script>
    <script src="http://www.openstreetmap.org/openlayers/OpenStreetMap.js" type="text/javascript"></script>

    <!-- geostats library -->
    <script src="${request.static_url('nextgis_elections:static/geostat/geostats.js')}"></script>

    <!-- Main section -->
    <script src="${request.static_url('nextgis_elections:static/js/main.js')}" type="text/javascript"></script>
    <script src="${request.static_url('nextgis_elections:static/js/render.js')}" type="text/javascript"></script>
    <script src="${request.route_url('setup_js')}" type="text/javascript"></script>


</head>
<body onload="init()">
    <div style="width:1000px;margin:0 auto">

    <div id="mapcont">
        <h3>Результаты выборов на столичных избирательных участках</h3>

        <div id="breadcrumbs">
            Текущее положение:
            %for i in range(4):
                <a class="breadcrumb" id="bc_${i+1}" href="#" onClick="NGe.selectBreadcrumb(${i+1}); return false;"></a>
            %endfor
        </div>

        <div id="map"></div>

        <div id="panel">

            <ul class="menu party">
                <li class="title">Голосование по партиям</li>

                %for party in parties:
                    <li class="switch icon p_party_${party.id}">
                        <input onChange="NGe.setRenderer('partyVote', {party_id: ${party.id}});"
                            type="radio" name="p_select" id="p_party_${party.id}">
                        <label for="p_party_${party.id}">${party.name}</label>
                    </li>
                %endfor
            </ul>

            <ul class="menu activity">
                <li class="title">Активность избирателей</li>

                <li class="switch sel">
                    <input onChange="NGe.setRenderer('presence', {});"
                        type="radio" name="p_select" id="p_votes" checked="yes">
                        <label for="p_votes">Явка</label>
                </li>
                <li class="switch">
                    <input onChange="NGe.setRenderer('invalid', {});"
                        type="radio" name="p_select" id="p_invalid">
                        <label for="p_invalid">Испорченные бюллетени</label>
                </li>
                <li class="switch">
                    <input onChange="NGe.setRenderer('abs', {});"
                        type="radio" name="p_select" id="p_abs">
                        <label for="p_abs">Голосование по открепительным</label>
                </li>
            </ul>

            <ul class="menu activity">
                <li class="title">Поиск по УИК или району</li>
                <input id="search" />
            </ul>

            <div class="legend">
                <h3>Обозначения</h3>

                <div id="legend_info">
                    <p class="title">Явка, %</p>
                    <ul class="colors">
                        <li><span style="background-color:#e2dee6" class="legend-block"></span>66 — 68</li>
                        <li><span style="background-color:#b9b2c0" class="legend-block"></span>68 — 70</li>
                        <li><span style="background-color:#90869a" class="legend-block"></span>70 — 73</li>
                        <li><span style="background-color:#665a74" class="legend-block"></span>73 — 75</li>
                        <li><span style="background-color:#3d2e4e" class="legend-block"></span>75 — 77</li>
                    </ul>
                </div>

                <ul class="addition">
                    <li class="icon1">Участки только<br/> с данными ЦИК</li>
                    <li class="icon2">Участки с копиями протоколов</li>
                </ul>
            </div>

            <p id="nextgis_logo"><a href="http://nextgis.ru/"><img src="http://nextgis.ru/wp-content/themes/nextgis/images/logo.png" border="0" width="200" height="43"/></a></p>
                
        </div>

        <div id="help">
            <p>Щелкайте по объектам для перехода на другой уровень. Наведите мышь, чтобы увидеть сводные результаты. Используйте панель навигации над картой чтобы переходить на предыдущие уровни.</p>

            <p>Результаты выборов: <a href="http://www.moscow_city.vybory.izbirkom.ru/">Мосизбирком</a><br/>
            Протоколы наблюдателей: <a href="http://nabludatel.org/">Гражданин-наблюдатель</a>, <a href="http://forbes.ru">Forbes</a><br/>
            Картоснова: Участники <a href="http://osm.org/">OpenStreetMap<a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a>
            </p>

            <p><b>Внимание:</b> данные из протоколов наблюдателей в процессе ввода!</p>
        </div>

    </div>



    </div>

    <div id="holder"></div> 
    <div class="tooltip"></div>



</body>
