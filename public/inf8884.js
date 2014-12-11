var mystore; //= rdfstore.create();
var requests = null;
/*
  var query2 = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
  PREFIX : <http://example.org/>\
  SELECT ?s FROM NAMED :people { GRAPH ?g { ?s rdf:type foaf:Person } }';

  var query1 = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
  PREFIX : <http://example.org/>\
  SELECT ?cl FROM NAMED :people { GRAPH ?g { ?s rdf:type ?cl } }';

  var query3 = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
  PREFIX akt: <http://www.aktors.org/ontology/portal#>\
  PREFIX : <http://example.org/>\
  SELECT ?n FROM NAMED :people { GRAPH ?g { \
    ?s a akt:Person . \
    ?s akt:full-name ?n \
    } FILTER ( STR(?n) = "Petko Valtchev") } ORDER BY ASC(?n) LIMIT 10';
*/
function print_data(item, prefix){
  var headstr = '<table>';var res='';
  var head = new Array();
  for(var i in item.value){
    //console.log('1 row!'+i);
    var j=item.value[i];
    res+='<tr>';
    var ii=0;
    for(var z in j){
      if(!head[ii]) head[ii] = z;
      var zz=j[z];
      res += '<td>';
      var is_uri = false;
      for(var zzz in zz){
        if(zz[zzz]==='uri') {
          //res += prefix+'['+z+']'+zzz + ':' + zz[zzz];
          is_uri = true;
        } else {
          if(is_uri){
          res += '<a href="'+zz[zzz]+'" target="_blank">'+zz[zzz]+'</a>';
          is_uri=false;
        } else {
          res += zz[zzz];
          }
        }
      }
      res += '</td>';
      ii++;
    }
    res += '</tr>';
  }
  for(var i=0;i<head.length;i++){
    headstr += '<th>'+head[i]+'</th>';
  }
  //alert('colonnes:'+head.length);
  res= headstr+res+'</table>';
    $("#place1").html(res);
    $('#containerTab1').text("");
    $('#containerTab1').prepend('<div style="margin: 20px">' + res + '</div>');
}

  var bindeditem=function(){
      this.value=null;
  };

  //aggregat pour les infos de requete
  //q => requete
  //b => bindeditem
  //e (function) => callback
  //s (true/false) => est ce que la requete est "autonome" ou pas
  //c'est a dire est ce que elle possede un callback specifique ou on utilise le callback general
  function stackitem(q,b,e,s){
      this.q=q,this.b=b,this.e=e,this.s=s;
  }

  //c'est la pile qui gere toutes les requetes
  //les requetes update/load passent en priorite, plutot font attendre les autres
  //dans le mode de fonctionnement originel, si on fait une requete load puis select,
  //vu que le load est plus long, le select se finit avant que le load est termine donc on a pas de resultats !!
  //la on charge notre stack tant qu'on veut, puis on fait stack.next()
  //elle va executer tout ce qu'il faut
  //puis a la fin elle fait un callback general
  //store => quel objet RDFStore on travaille,
  //cb => callback general
  function stack(store/*,cb*/){
    //la pile qui contient nos requetes courrantes
    this.stack=new Array(),
    this.ustack=new Array(),
    this.lock=false,
    this.current=null,
    this.store=store,
    //this.cb=cb,
    this.i=0,
    this.resultsets=new Array(),
    this.clear=function(){
      this.stack=new Array();
      this.ustack=new Array();
      this.lock=false;
      this.current=null;
      this.resultsets=new Array();
    },
    //comment on ajoute une requete select
    this.query = function(item){
        console.log('Adding new query');
        this.stack.push(item);
    },
    //comment on ajoute une requete de modification
    this.update = function(item){
        console.log('Adding new update query');
        this.ustack.push(item);
    },
    this.next = function(){
        if(this.ustack.length>0){
            console.log('Ustack non vide!');
            //on verrouille la pile
            //var u,i;u=this.ustack,i=u[0];
            this.current=this.ustack.shift();//on supprime le premier item
            //this.ustack[0]();//on execute le premier item
            this.store.execute(requests.current.q, function(a,b){
                //console.log(requests.ustack.length);
                requests.current.b.value = b;//on transmet la valeur
                if(!requests.current.s&&!requests.current.e!==null){
                    requests.resultsets.push(requests.current.b);//on stocke les infos dans le resultset
                    requests.i++;
                }
                else{
                    requests.current.e && requests.current.e(requests.current);//on execute le callback ?
                }
                //console.log(requests.stack.length+'&&'+requests.ustack.length);
                if(requests.stack.length>0||requests.ustack.length>0){
                    //console.log('ugo next:'+requests.stack.length+'&&'+requests.ustack.length);
                    requests.next();
                }else{
                    console.log('On a fini (us)');
                    //requests.cb();
                }
            });
        }
        else if(this.stack.length>0){
            console.log('stack non vide!');
            //var s,i;s=this.stack,i=s[0];
            this.current=this.stack.shift();
            this.store.execute(requests.current.q, function(a,b){
                requests.current.b.value = b;//on transmet la valeur au bindeditem
                if(!requests.current.s&&!requests.current.e!==null){
                    requests.resultsets.push(requests.current.b);//on stocke les infos dans le resultset
                    requests.i++;
                }
                else{
                    requests.current.e && requests.current.e(requests.current);//on execute le callback si il y en a un
                }
                if(requests.stack.length>0||requests.ustack.length>0){
                    requests.next();
                }else{
                    console.log('on a fini (s)');
                    //requests.cb();
                }
            });
        }
        else{
            console.log('la stack est vide!');//normalement n'arrive jamais
        }
    };
  }
  /**
   * On charge des donnees pour initialiser le store
   * On peut lui faire faire charger autant de choses que l'on veut.
   * Ensuite une fois que tout est fait, c'est la methode onstoreloaded qui prend la main!
   * @param {type} store
   * @returns {undefined}
   */
  function sparql_update() {
  	window.setTimeout(function(){$("body").addClass("loading");},1);
    $("#place3").text($("#place2").text());
    $("#place2").text('sparql_update:' + $("#jqxWidget").jqxListBox('getSelectedItem').label);

    mystore.execute($("#query1").val(),
      function(){
        console.log('function store.execute');
    });
    window.setTimeout(function(){$("body").removeClass("loading");},1000);
  }

  function sparql_query() {
  	window.setTimeout(function(){$("body").addClass("loading");},1);
    $("#place3").text($("#place2").text());
    $("#place2").text('sparql_query():' + $("#jqxWidget").jqxListBox('getSelectedItem').label);
    var aaa=new bindeditem();
    requests.query(new stackitem($("#query1").val(),aaa,function(item){
      console.log('query#2 loaded!');
      print_data(item.b, 'Query');
    },true));

    requests.next();
    window.setTimeout(function(){$("body").removeClass("loading");},500);
  }

  $(document).ready(function () {
    $("#place2").text('creating store...');
    mystore = rdfstore.create();
    $("#place3").text($("#place2").text());
    $("#place2").text('store created.');
    requests = new stack(mystore);
    var source =
    {
        datatype: "json",
        datafields: [
            { name: 'description' },
            { name: 'query' }
        ],
        id: 'id',
        url: 'query.json'
    };

    $('#jqxTabs').jqxTabs({ height: 450, width: '100%',  keyboardNavigation: false });

    var dataAdapter = new $.jqx.dataAdapter(source);
    // Create a jqxListBox
    $("#jqxWidget").jqxListBox({ source: dataAdapter, displayMember: "description", valueMember: "query", width: 200, height: 350, theme: '' });
    $("#jqxWidget").bind('select', function (event) {
      if (event.args) {
        var item = event.args.item;
        if (item) {
          $("#query1").val(item.value);

        }
      }
    });
  });