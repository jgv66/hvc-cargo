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
                    where ( p.pickeador_asignado is null or p.pickeador_asignado = 0 )
                      and p.fecha_entregareal is null ) begin
            --
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                   p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                   p.obs_carga,p.peso,p.volumen,p.bultos,p.tipo_pago,
                   convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion,
                   convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                   cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                   cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                   coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                   des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                   des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                   coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2 
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            where ( p.pickeador_asignado is null or p.pickeador_asignado = 0 )
              and p.fecha_entregareal is null 
            order by p.orden_de_pickeo, p.fecha_creacion ;
            --
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen encomiendas pendientes' as mensaje;
            --
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
    misPendientes: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
        if exists ( select * 
                    from k_paquetes as p with (nolock)
                    where p.pickeador_asignado = ${ body.ficha }
                      and p.fecha_entregareal is null ) begin
            --
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                   p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                   p.obs_carga,p.peso,p.volumen,p.bultos,p.tipo_pago,
                   convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion,
                   convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                   cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                   cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                   coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                   des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                   des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                   coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2 
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            where p.pickeador_asignado = ${ body.ficha }
              and p.fecha_entregareal is null 
            order by p.orden_de_pickeo, p.fecha_creacion ;
            --
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen encomiendas pendientes' as mensaje;
            --
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
    pickeoEsMio: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
        if exists ( select * 
                    from k_paquetes as p with (nolock)
                    where p.id_paquete = ${ body.id }
                      and ( p.pickeador_asignado is null or p.pickeador_asignado = 0 )
                      and p.fecha_entregareal is null ) begin
            --
            begin transaction;
            update k_paquetes set pickeador_asignado = ${ body.ficha }, fecha_acepta_pickeo = getdate() where id_paquete = ${ body.id };
            insert into k_paquetes_estado (id_paquete,usuario,fecha,comentario) values ( ${ body.id }, ${ body.ficha }, getdate(), 'Retirador asignado' );
            commit transaction;
            --
            select cast(1 as bit) as resultado,cast(0 as bit) as error, 'Asignado exitosamente!' as mensaje;
            --
        end
        else begin
            --
            select cast(0 as bit) as resultado,cast(1 as bit) as error,'Paquete ya tiene un despachador asignado.' as mensaje;
            --
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
    ordenarMiPickeo: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
            --
            update k_paquetes set orden_de_pickeo = ${ body.orden } where id_paquete = ${ body.id };
            --
            select cast(1 as bit) as resultado,cast(0 as bit) as error, 'Ordenado exitosamente!' as mensaje;
            --
        end
        else begin
            --
            select cast(0 as bit) as resultado,cast(1 as bit) as error,'Paquete ya tiene un despachador asignado.' as mensaje;
            --
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