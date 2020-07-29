 select * from (
 select a.IdArticulo item_id
      , a.Descripcion item_description
	  , cp.Fecha update_date
	  , cp.PrecioPublico price
	  ,ROW_NUMBER()
      over (Partition BY a.IdArticulo
                ORDER BY cp.Fecha DESC ) AS rank
   from Articulos a inner join GruposArticulos ga
     on a.IdGrupoArticulo = ga.IdGrupoArticulo inner join CambiosPrecio cp
	 on a.IdArticulo = cp.IdArticulo
  where ga.Combustible = 1 ) temp
where rank = 1;