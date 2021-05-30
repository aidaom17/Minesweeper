$(document).ready(function()
{
   
    var cnv = $( "#cnv" ).get(0);
    var ctx = cnv.getContext('2d');
    ctx.font = "bold 14px Arial";

    //pamtimo koja smo polja otkrili, kako bi detektirali pobjedu 
    var otkriveni = [];
    for (var i=0; i<9; i++)
    {
        otkriveni[i] = [];
        for (var j=0; j<9; j++)
            otkriveni[i][j] =0;
    } 

    $('#cnv').hide();
    $('#pocni').on('click', function()
    {
        $.ajax(
        {
            url: 'https://rp2.studenti.math.hr/~zbujanov/dz4/id.php',
            method: 'get',
            data:
            {
                nRows: 9,
                nCols: 9,
                nMines: 10
            },
            success: function(data)
            {
                if( data.hasOwnProperty('error'))
                    $('#greska').html(data.error);
                else if (data.hasOwnProperty('id'))
                {
                    $('#greska').html(''); //ako nije doslo do greske -> ispraznimo span
                    localStorage.setItem('id', data.id);
                    nacrtaj_plocu();
                }
            },
            error: function()
            {
                console.log('Greška u ajax pozivu..');
            }            
        });
    });


    //na desni klik -> oznaka upitnik
    $('#cnv').on("contextmenu", function() { return false; });
    $('#cnv').on('contextmenu', function(event) 
    {
        var lokacija = nadi_lokaciju(event.clientX, event.clientY);

        ctx.strokeText('?', lokacija.x*50+25, lokacija.y*50+30);
    });

    //na lijevi klik -> bomba ili otkrivanje novih polja
    $('#cnv').on('click', function(event)
    {
        var koji_klik = event.button;
        var lokacija = nadi_lokaciju(event.clientX, event.clientY);

        $.ajax(
        {
            url: 'https://rp2.studenti.math.hr/~zbujanov/dz4/cell.php',
            method: 'get',
            data:
            {
                col: lokacija.x,
                row: lokacija.y,
                id: localStorage.getItem('id')
            },
            success: function(data)
            {
                if( data.hasOwnProperty('error'))
                    $('#greska').html(data.error);
                else //if (data.hasOwnProperty('id'))
                {
                    $('#greska').html(''); //ako nije doslo do greske -> ispraznimo span
                    if( koji_klik === 0)
                    {
                        //izgubio si
                        if (data.boom) //true
                        {
                            //nacrtaj bombu
                            var img = new Image();
                            img.src = "bomba.jpeg";
                            $(img).on('load', function()
                            {
                                ctx.drawImage (this, lokacija.x*50, lokacija.y*50, 50,50);
                            });
                            //ispisi poruku
                            poraz_ili_pobjeda('Izgubio si. :(');
                        }//nastavak igre
                        else 
                            otkrij_polja(data);
                    }
                }
            },
            error: function()
            {
                console.log('Greška u ajax pozivu..');
            }            
        });
        
    });
//----------------------------------------------------------------------
    function poraz_ili_pobjeda(poruka)
    {
        //ispisi poruku
        window.alert(poruka);

        //makni i ocisti canvas
        $('#cnv').hide();
        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

        for (var i=0;i<9;i++)
            for (var j=0;j<9;j++)
                otkriveni[i][j] =0;
    }

    function otkrij_polja(data)
    {
        var boje = {
            1: "blue",
            2: "red",
            3: "green",
            4: "orange"
        };
        var polja = data.cells;
        for (var i=0; i<polja.length; i++)
        {
            var tekst=null;
            if (polja[i].mines !== 0)
                tekst = polja[i].mines;
            else
                tekst='';
            
            ctx.clearRect(polja[i].col*50, polja[i].row*50, 50, 50);

            ctx.fillStyle = "#B0E0E6";
            ctx.fillRect(polja[i].col*50, polja[i].row*50, 50, 50);

            ctx.fillStyle=boje[polja[i].mines];
            ctx.fillText(tekst, polja[i].col*50+25, polja[i].row*50+30);

            var k = (Number)(polja[i].col);
            var l = (Number)(polja[i].row);
            otkriveni[l][k] = 1;

            //možda je pobijedio?
            if (popunjena_tablica())
                poraz_ili_pobjeda('Pobijedio si! :)');
        }
    }

    function nadi_lokaciju(pos_x, pos_y)
    {
        var rect = cnv.getBoundingClientRect();
        var x = pos_x - rect.left;
        var y = pos_y - rect.top;
        var row = Math.floor(y/50);
        var col = Math.floor(x/50);

        var lokacija = new Object();
        lokacija.x = col;
        lokacija.y = row;

        return lokacija;
    }

    function nacrtaj_plocu()
    {
        $('#cnv').show();
        
        //idemo do 8 jer vec imamo 'border'
        for (var i=1; i<=8; i++) //vertikalne linije
        {
            novi_x = i*50;
            ctx.beginPath();
            ctx.moveTo(novi_x, 0);
            ctx.lineTo(novi_x, 450);
            ctx.stroke(); 
        }
        for (var i=1; i<=8; i++) //horizontalne linije
        {
            novi_y = i*50;
            ctx.beginPath();
            ctx.moveTo(0, novi_y);
            ctx.lineTo(450, novi_y);
            ctx.stroke(); 
        }
    }

    function popunjena_tablica()
    {
        var pobjeda = 0;
        for( var i=0; i<9; i++)
            for( var j=0; j<9; j++)
                if (otkriveni[i][j] === 1)
                    pobjeda++;

        if (pobjeda === 9*9-10)
            return true;
        return false;
    }
});

