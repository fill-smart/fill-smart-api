select * from (
select top 10000
       d.IdDespacho transaction_id
      ,d.fecha date
      ,d.IdManguera pipe_id
      ,m.IdSurtidor dispacher_id
      ,m.cara dispacher_side
      ,a.IdArticulo product_id
      ,a.Descripcion description
      ,d.cantidad quantity
      ,d.PrecioPublico unit_price
      ,d.importe total
      ,ROW_NUMBER()
      over (Partition BY m.IdSurtidor
                ORDER BY d.IdDespacho DESC ) AS Rank
from despachos d,articulos a, mangueras m
where
d.IdArticulo=a.IdArticulo and
d.IdManguera=m.IdManguera and
IdMovimientoFac is null and
d.fecha > dateadd(hour, -12, CURRENT_TIMESTAMP)
order by m.IdSurtidor, d.IdDespacho desc) a
where rank < 11