module.exports = {

    // cada funncion se separa por comas  
    validaUsuario: function(sql, body) {
        //  
        var request = new sql.Request();
        //
        return request.query(`select cast(1 as bit) as resultado,'HVC-Cargo' as nombreemp,u.* 
                              from k_usuarios as u
                              where lower(u.email)='${body.email}'
                                and u.clave='${ body.clave }' ;`)
            .then(function(results) {
                return results.recordset;
            });
    },
    //
    pickeoPendiente: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
        if exists ( select * 
                    from k_paquetes as p with (nolock)
                    where ( p.pickeador_asignado is null or p.pickeador_asignado = 0 or p.pickeador_asignado = ${body.ficha} )
                      and p.fecha_entregareal is null ) begin
              select cast(1 as bit) as resultado,'' as mensaje,p.id_paquete,
                      p.cliente,p.obs_carga,p.destinatario,p.fecha_creacion,p.fecha_prometida,
                      cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                      cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                      cli.referencias as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                      des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                      des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                      des.referencias as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2            
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            where ( p.pickeador_asignado is null or p.pickeador_asignado = 0 or p.pickeador_asignado = ${body.ficha} )
              and p.fecha_entregareal is null 
            order by p.fecha_creacion ;
        end
        else begin
            select cast(0 as bit) as resultado,'' as mensaje;
        end; `;
        console.log(query);
        // --------------------------------------------------------------------------------------------------
        var request = new sql.Request();
        //
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
    },
    //
};