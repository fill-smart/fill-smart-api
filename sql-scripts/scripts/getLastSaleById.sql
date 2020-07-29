select top 1
       d.IdDespacho transaction_id
      ,d.fecha date
      ,d.IdManguera pipe_id
      ,m.IdSurtidor dispacher_id
      ,m.Cara dispacher_side
      ,a.IdArticulo product_id
      ,a.Descripcion description
      ,d.cantidad quantity
      ,d.PrecioPublico unit_price
      ,d.importe total 
from despachos d,articulos a, mangueras m
where
d.IdArticulo=a.IdArticulo and
d.IdManguera=m.IdManguera and
IdMovimientoFac is null and
m.IdSurtidor = '{0}' and
m.cara = '{1}'
order by m.IdSurtidor, d.IdDespacho desc