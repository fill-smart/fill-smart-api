select C.IdTanque tank_code,
	   C.IdArticulo item_id,
	   A.Descripcion item_description ,
	   C.StockActual stock,
	   C.LastUpdated last_update 
  from CierresDetalleTanques C,Articulos A 
 where 1 = 1 and 
     C.IdArticulo=A.IdArticulo and
     C.LastUpdated in (select max(lastupdated) from CierresDetalleTanques group by IdArticulo,idtanque) 
 order by c.LastUpdated desc;