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
                      and p.fecha_pickeo_real is null ) begin
            --
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                   p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                   p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
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
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            where ( p.pickeador_asignado is null or p.pickeador_asignado = 0 )
              and p.fecha_pickeo_real is null 
            order by p.orden_de_pickeo, p.fecha_creacion ;
            --
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen encomiendas pendientes' as mensaje;
            --
        end; `;
        // console.log(query);
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
                      and p.fecha_pickeo_real is null ) begin
            --
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                   p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                   p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
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
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            where p.pickeador_asignado = ${ body.ficha }
              and p.fecha_pickeo_real is null 
            order by p.orden_de_pickeo, p.fecha_creacion ;
            --
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen encomiendas pendientes' as mensaje;
            --
        end; `;
        // console.log(query);
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
                      and p.fecha_pickeo_real is null ) begin
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
        // console.log(query);
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
        let q = '';
        body.orden.forEach(elem => {
            q += 'update k_paquetes set orden_de_pickeo = ' + elem.orden.toString() + ' where id_paquete = ' + elem.id.toString() + ' ; ';
        });
        //
        var query = `
        begin try
            --
            begin transaction
            ##q##
            commit transaction 
            --
            select cast(1 as bit) as resultado,cast(0 as bit) as error, 'Ordenado exitosamente!' as mensaje;
            --
        end try
        begin catch
            --
            select cast(0 as bit) as resultado,cast(1 as bit) as error,'Paquete ya tiene un despachador asignado.' as mensaje;
            --
        end catch; `;
        query = query.replace('##q##', q);
        // console.log(query);
        // --------------------------------------------------------------------------------------------------
        var request = new sql.Request();
        //
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
    },
    //
    paqueteRecogido: function(sql, body) {
        //
        const obs = (body.obs === undefined) ? '' : body.obs;
        const nroDoc = (body.nroDoc === undefined) ? '' : body.nroDoc;
        // --------------------------------------------------------------------------------------------------
        const query = `
        begin try 
            if exists ( select * 
                        from k_paquetes as p with (nolock)
                        where p.id_paquete = ${ body.id_pqt }
                          and p.pickeador_asignado = ${ body.ficha } ) begin
                --
                begin transaction;
                update k_paquetes set obs_pickeo = '${ obs }',
                                    documento_legal='G/B/F',
                                    numero_legal='${ nroDoc }',
                                    fecha_pickeo_real = getdate(),
                                    picking_ok = 1
                where id_paquete = ${ body.id_pqt };
                insert into k_paquetes_estado (id_paquete,usuario,fecha,comentario)
                                    values ( ${ body.id_pqt }, ${ body.ficha }, getdate(), 'Retirada desde remitente' );
                commit transaction;
                --
                select cast(1 as bit) as resultado,cast(0 as bit) as error, 'Recogido exitosamente!' as mensaje;
                --
            end
            else begin
                --
                select cast(0 as bit) as resultado,cast(1 as bit) as error,'Paquete y Retirador no coinciden.' as mensaje;
                --
            end; 
        end try
        begin catch
            if (@@TRANCOUNT > 0 ) rollback transaction;
            select cast(0 as bit) as resultado,cast(1 as bit) as error,ERROR_MESSAGE() as mensaje;
        end catch; `;
        // console.log(query);
        // --------------------------------------------------------------------------------------------------
        var request = new sql.Request();
        //
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
    },
    //
    saveIMG: function(sql, ib64, extension, id_pqt) {
        // 
        var query = `insert into k_paquetes_img 
                            ( id_paquete, fechains, img_exten, img_name ) 
                     values ( ${ id_pqt }, getdate(), '${ extension }', '${ ib64 }' ) ;`;
        // console.log('saveIMG', query);
        const request = new sql.Request();
        return request.query(query)
            .then(resultado => {
                return resultado.recordset;
            })
            .then(resultado => {
                return { resultado: 'ok', datos: resultado };
            })
            .catch(err => {
                console.log('saveIMG error ', err);
                return { resultado: 'error', datos: err };
            });
    },
    // 
    getImages: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
            select id_paquete,fechains,imagen_ext as extension,imagen_b64 as imgb64
            from k_paquetes_img with (nolock)
            where id_paquete = ${ body.id_pqt }
              and imagen_ext is not null ; `;
        console.log(query);
        //
        const request = new sql.Request();
        return request.query(query)
            .then(resultado => {
                return resultado.recordset;
            })
            .then(resultado => {
                // console.log(JSON.stringify(resultado));
                if (resultado) {
                    return { resultado: 'ok', datos: JSON.stringify(resultado) };
                } else {
                    return { resultado: 'error', datos: resultado };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
    },
    //
    acopioPendiente: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
        if exists ( select * 
                    from k_paquetes as p with (nolock)
                    where p.pickeador_asignado = ${ body.ficha }
                      and p.fecha_pickeo_real is not null
                      and p.fecha_acopio is null ) begin
            --
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje, cast(0 as bit) as marcado, 
                   p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                   p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
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
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            where p.pickeador_asignado = ${ body.ficha }
              and p.fecha_pickeo_real is not null
              and p.fecha_acopio is null
            order by p.orden_de_pickeo, p.fecha_creacion ;
            --
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen acopios pendientes' as mensaje;
            --
        end; `;
        // console.log(query);
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