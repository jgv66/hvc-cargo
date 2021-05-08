//
var pdfs = require('html-pdf');
var path = require('path');
//
module.exports = {

    // cada funncion se separa por comas  
    validaUsuario: function(sql, body) {
        //  
        var request = new sql.Request();
        //
        return request.query(`select cast(1 as bit) as resultado,'HVC-Cargo' as nombreemp,u.* 
                        from k_usuarios as u
                        where lower(u.email)='${body.email}'
                        and u.clave='${ body.clave }'
                        and u.vigente = 1 ;`)
            .then(function(results) {
                return results.recordset;
            });
    },
    //   
    todos: function(sql, body) {
        //  
        var request = new sql.Request();
        //
        return request.query('SELECT * FROM k_usuarios where vigente = 1 order by nombre ;')
            .then(function(results) {
                return results.recordset;
            });
    },
    //
    sinTransportar: function(sql) {
        const query = `
        with ids
        as ( SELECT e.id_paquete,max(e.fecha) as fecha
                FROM k_paquetes_estado as e with (nolock)
                GROUP BY e.id_paquete ),
        estados 
        as ( select e.*, us.nombre
                FROM k_paquetes_estado as e with (nolock)
                inner join ids as i on i.id_paquete = e.id_paquete and i.fecha = e.fecha
                left join k_usuarios as us with (nolock) on us.id = e.usuario )
        select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,cast(0 as bit) as isExpanded,
                p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                p.numero_legal,p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(5),p.fecha_creacion,108) as hora_creacion, 
                convert( nvarchar(10),p.fecha_prometida,103) as fecha_prometida,CONVERT(varchar(10), p.fecha_prometida,126) as llegada,
                cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion,
                coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador,
                p.documento_legal,p.numero_legal 
        from k_paquetes as p
        left join k_clientes as cli on cli.id_cliente=p.cliente
        left join k_clientes as des on des.id_cliente=p.destinatario
        left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
        left join estados    as est on est.id_paquete = p.id_paquete
        where p.fecha_cierre is null
            and ( not exists ( select * 
                                   from k_paquetes_estado as es with (nolock) 
                               where es.id_paquete = p.id_paquete 
                                 and es.estado = 300 )
                or (exists ( select * 
                             from k_paquetes_estado as es with (nolock) 
                             where es.id_paquete = p.id_paquete 
                               and es.estado = 300 )
                     and not exists ( select * 
                                         from k_paquetes_estado as es with (nolock) 
                                      where es.id_paquete = p.id_paquete 
                                        and es.estado between 400 and 600 ) )
                or (exists ( select * 
                             from k_paquetes_estado as es with (nolock) 
                             where es.id_paquete = p.id_paquete 
                               and es.estado = 400 )
                    and not exists ( select * 
                                     from k_paquetes_estado as es with (nolock) 
                                     where es.id_paquete = p.id_paquete 
                                       and es.estado between 420 and 600 ) ) )
        order by p.id_paquete desc ;
        `;
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
    pickeoPendienteWeb: function(sql) {
        const query = `
        if exists ( select * 
                    from k_paquetes as p with (nolock)
                    where p.fecha_cierre is null
                      and not exists ( select * 
                                       from k_paquetes_estado as es with (nolock) 
                                       where es.id_paquete = p.id_paquete 
                                         and es.estado > 299 ) ) begin
            with ids
            as ( SELECT e.id_paquete,max(e.fecha) as fecha
                    FROM k_paquetes_estado as e with (nolock)
                    GROUP BY e.id_paquete ),
            estados 
            as ( select e.*, us.nombre
                    FROM k_paquetes_estado as e with (nolock)
                    inner join ids as i on i.id_paquete = e.id_paquete and i.fecha = e.fecha
                    left join k_usuarios as us with (nolock) on us.id = e.usuario )
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                    p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                    p.numero_legal,p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                    convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(5),p.fecha_creacion,108) as hora_creacion, 
                    convert( nvarchar(10),p.fecha_prometida,103) as fecha_prometida,CONVERT(varchar(10), p.fecha_prometida,126) as llegada,
                    cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                    cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                    coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                    des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                    des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                    coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                    convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion,
                    coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador,
                    p.documento_legal,p.numero_legal  
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            left join estados    as est on est.id_paquete = p.id_paquete
            where p.fecha_cierre is null
                and not exists ( select * 
                                from k_paquetes_estado as es with (nolock) 
                                where es.id_paquete = p.id_paquete 
                                    and es.estado = 300 )
            order by p.fecha_creacion, p.orden_de_pickeo  ;
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen retiros pendientes' as mensaje;
            --
        end;
        `;
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
    pickeoPendiente: function(sql, body) {
        console.log(body);
        // --------------------------------------------------------------------------------------------------
        var query = `
            if exists ( select * 
                        from k_paquetes as p with (nolock)
                        where p.fecha_cierre is null
                            and not exists ( select * 
                                            from k_paquetes_estado as es with (nolock) 
                                            where es.id_paquete = p.id_paquete 
                                                and es.estado = 200 ) ) begin
                --
                select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                        p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                        p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                        convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(8),p.fecha_creacion,108) as hora_creacion, 
                        convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                        cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                        cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                        coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                        des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                        des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                        coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                        p.documento_legal,p.numero_legal  
                from k_paquetes as p
                left join k_clientes as cli on cli.id_cliente=p.cliente
                left join k_clientes as des on des.id_cliente=p.destinatario
                left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago
                where p.fecha_cierre is null
                    and not exists ( select * 
                                    from k_paquetes_estado as es with (nolock) 
                                    where es.id_paquete = p.id_paquete 
                                        and es.estado = 200 )
                order by p.id_paquete, p.fecha_creacion ;
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
                        where p.fecha_cierre is null
                            and exists ( select * 
                                            from k_paquetes_estado as es with (nolock) 
                                            where es.id_paquete = p.id_paquete 
                                                and es.estado = 200
                                                and es.usuario = ${ body.ficha } )
                        and not exists ( select * 
                                            from k_paquetes_estado as es with (nolock) 
                                            where es.id_paquete = p.id_paquete 
                                            and es.estado = 300 ) ) begin
                --
                select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                        p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                        p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                        convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(8),p.fecha_creacion,108) as hora_creacion, 
                        convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                        cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                        cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                        coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                        des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                        des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                        coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                        p.documento_legal,p.numero_legal 
                from k_paquetes as p
                left join k_clientes as cli on cli.id_cliente=p.cliente
                left join k_clientes as des on des.id_cliente=p.destinatario
                left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
                where p.fecha_cierre is null
                    and exists ( select * 
                                from k_paquetes_estado as es with (nolock) 
                                where es.id_paquete = p.id_paquete 
                                    and es.estado = 200
                                    and es.usuario = ${ body.ficha } )
                    and not exists ( select * 
                                    from k_paquetes_estado as es with (nolock) 
                                    where es.id_paquete = p.id_paquete 
                                        and es.estado = 300 )
                order by p.id_paquete, p.fecha_creacion ;
                --
            end
            else begin
                --
                select cast(0 as bit) as resultado,'No existen encomiendas pendientes' as mensaje;
                --
            end; 
        `;
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
                        and p.fecha_cierre is null
                        and not exists ( select * 
                                        from k_paquetes_estado as es with (nolock) 
                                        where es.id_paquete = p.id_paquete 
                                            and es.estado = 200 ) ) begin
                --
                insert into k_paquetes_estado (id_paquete,usuario,fecha,comentario,estado) 
                values ( ${ body.id }, ${ body.ficha }, getdate(), 'Retirador asignado',200);
                --
                select cast(1 as bit) as resultado,cast(0 as bit) as error, 'Asignado exitosamente!' as mensaje;
                --
            end
            else begin
                --
                select cast(0 as bit) as resultado,cast(1 as bit) as error,'Paquete ya tiene un despachador asignado.' as mensaje;
                --
            end; 
        `;
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
            end catch; 
        `;
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
        const picking_ok = (body.problema === true) ? 'NO' : 'SI';
        // --------------------------------------------------------------------------------------------------
        const query = `
            --
            declare @Error	nvarchar(250) , 
                    @ErrMsg	nvarchar(2048); 
            --
            begin try 
                if exists ( select * 
                            from k_paquetes as p with (nolock)
                            where p.id_paquete = ${ body.id_pqt } ) begin
                    begin transaction
                        --
                        update k_paquetes set obs_pickeo = '${ obs }', numero_legal='${ nroDoc }', picking_ok = '${ picking_ok }', documento_legal=''
                        where id_paquete = ${ body.id_pqt };
                        --
                        set  @Error = @@ERROR
                        if ( @Error <> 0 ) begin
                            set @ErrMsg = ERROR_MESSAGE();
                            THROW @Error, @ErrMsg, 0 ;  
                        end	
                        -- sin problemas
                        if ( ${ body.problema === true ? 1 : 0 } = 0 ) begin
                            insert into k_paquetes_estado (id_paquete,usuario,fecha,comentario,estado)
                            values ( ${ body.id_pqt }, ${ body.ficha }, getdate(), 'Encomienda retirada', 300 );
                            --
                            set  @Error = @@ERROR
                            if ( @Error <> 0 ) begin
                                set @ErrMsg = ERROR_MESSAGE();
                                THROW @Error, @ErrMsg, 0 ;  
                            end	
                            --
                        end
                        -- con dramas
                        else begin
                            insert into k_paquetes_estado (id_paquete,usuario,fecha,estado,comentario)
                            values ( ${ body.id_pqt }, ${ body.ficha }, getdate(), ${ body.queprobl }, ( select top 1 descripcion from k_estados where estado = ${ body.queprobl } ) );
                            --
                            set  @Error = @@ERROR
                            if ( @Error <> 0 ) begin
                                set @ErrMsg = ERROR_MESSAGE();
                                THROW @Error, @ErrMsg, 0 ;  
                            end	
                            --
                        end;
                        --
                    commit transaction
                    --
                    select cast(1 as bit) as resultado,cast(0 as bit) as error, 'Recogido exitosamente!' as mensaje;
                    --
                end
                else begin
                    --
                    select cast(0 as bit) as resultado,cast(1 as bit) as error,'Encomienda no Existe' as mensaje;
                    --
                end; 
            end try
            begin catch
                --
                if (@@TRANCOUNT > 0 ) rollback transaction;
                --
                select cast(0 as bit) as resultado,cast(1 as bit) as error,ERROR_MESSAGE() as mensaje;
            end catch; 
        `;
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
    saveDefinitionIMG: function(sql, ib64, extension, id_pqt) {
        // 
        var query = `
            insert into k_paquetes_img ( id_paquete, fechains, img_exten, img_name ) 
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
            if exists ( select * from k_paquetes_img with (nolock) where id_paquete = ${ body.id_pqt } ) begin
                select 'ok' as resultado, img_name as imgb64
                        ,convert(nvarchar(10), fechains, 103) as fecha
                        ,convert(nvarchar(5), fechains, 108) as hora 
                from k_paquetes_img with (nolock) 
                where id_paquete = ${ body.id_pqt };
            end
            else begin
                select 'nodata' as resultado
            end; 
        `;
        //
        // console.log(query);
        //
        const request = new sql.Request();
        return request.query(query)
            .then(resultado => {
                return resultado.recordset;
            })
            .then(resultado => {
                if (resultado) {
                    return { resultado: 'ok', datos: resultado };
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
    enAcopioPendienteWeb: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
        --
        with ids as ( select e.id_paquete,max(e.fecha) as fecha
                    from k_paquetes_estado as e with (nolock)
                    group BY e.id_paquete ),
        estados as ( select e.*, us.nombre
                    from k_paquetes_estado as e with (nolock)
                    inner join ids as i on i.id_paquete = e.id_paquete and i.fecha = e.fecha
                    left join k_usuarios as us with (nolock) on us.id = e.usuario )
        select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje, cast(0 as bit) as marcado, 
                p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                p.obs_carga,p.obs_pickeo,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(8),p.fecha_creacion,108) as hora_creacion, 
                convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion,
                coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador,
                p.documento_legal,p.numero_legal 
        from k_paquetes as p
        left join k_clientes as cli on cli.id_cliente=p.cliente
        left join k_clientes as des on des.id_cliente=p.destinatario
        left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
        left join estados    as est on est.id_paquete = p.id_paquete
        where exists ( select * 
                    from k_paquetes_estado as es with (nolock) 
                    where es.id_paquete = p.id_paquete 
                    and es.estado = 400 )
        and not exists ( select * 
                        from k_paquetes_estado as es with (nolock) 
                        where es.id_paquete = p.id_paquete 
                            and es.estado between 420 and 600 ) 
        order by p.orden_de_pickeo, p.fecha_creacion ;`;
        // --------------------------------------------------------------------------------------------------
        // console.log(query);
        var request = new sql.Request();
        //
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
    },
    //
    acopioPendiente: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
            if exists ( select * 
                        from k_paquetes as p with (nolock)
                        where exists ( select * 
                                        from k_paquetes_estado as es with (nolock) 
                                        where es.id_paquete = p.id_paquete 
                                        and es.estado = 300
                                        and es.usuario = ${ body.ficha } )
                            and not exists ( select * 
                                            from k_paquetes_estado as es with (nolock) 
                                            where es.id_paquete = p.id_paquete 
                                            and es.estado between 400 and 600 ) ) begin
                --
                select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje, cast(0 as bit) as marcado, 
                        p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                        p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                        convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(8),p.fecha_creacion,108) as hora_creacion, 
                        convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                        cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                        cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                        coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                        des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                        des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                        coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                        p.documento_legal,p.numero_legal 
                from k_paquetes as p
                left join k_clientes as cli on cli.id_cliente=p.cliente
                left join k_clientes as des on des.id_cliente=p.destinatario
                left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
                where exists ( select * 
                                from k_paquetes_estado as es with (nolock) 
                                where es.id_paquete = p.id_paquete 
                                and es.estado = 300
                                and es.usuario = ${ body.ficha } )
                    and not exists ( select * 
                                    from k_paquetes_estado as es with (nolock) 
                                    where es.id_paquete = p.id_paquete 
                                    and es.estado between 400 and 600 ) 
                order by p.orden_de_pickeo, p.fecha_creacion ;
                --
            end
            else begin
                --
                select cast(0 as bit) as resultado,'No existen acopios pendientes' as mensaje;
                --
            end; 
        `;
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
    porAcopiarPendienteWeb: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
            if exists ( select * 
                        from k_paquetes as p with (nolock)
                        where exists ( select * 
                                        from k_paquetes_estado as es with (nolock) 
                                        where es.id_paquete = p.id_paquete 
                                            and es.estado = 300 )
                            and not exists ( select * 
                                            from k_paquetes_estado as es with (nolock) 
                                            where es.id_paquete = p.id_paquete 
                                            and es.estado between 420 and 600 ) ) begin
                --
                with ids as ( select e.id_paquete,max(e.fecha) as fecha
                                from k_paquetes_estado as e with (nolock)
                                group BY e.id_paquete ),
                estados as ( select e.*, us.nombre
                                from k_paquetes_estado as e with (nolock)
                                inner join ids as i on i.id_paquete = e.id_paquete and i.fecha = e.fecha
                                left join k_usuarios as us with (nolock) on us.id = e.usuario )
                select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje, cast(0 as bit) as marcado, 
                        p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                        p.obs_carga,p.obs_pickeo,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                        convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(8),p.fecha_creacion,108) as hora_creacion, 
                        convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                        cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                        cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                        coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                        des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                        des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                        coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                        convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion,
                        coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador,
                        p.documento_legal,p.numero_legal 
                from k_paquetes as p
                left join k_clientes as cli on cli.id_cliente=p.cliente
                left join k_clientes as des on des.id_cliente=p.destinatario
                left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
                left join estados    as est on est.id_paquete = p.id_paquete
                where exists ( select * 
                                from k_paquetes_estado as es with (nolock) 
                                where es.id_paquete = p.id_paquete 
                                and es.estado = 300 )
                    and not exists ( select * 
                                    from k_paquetes_estado as es with (nolock) 
                                    where es.id_paquete = p.id_paquete 
                                        and es.estado between 400 and 600 ) 
                order by p.orden_de_pickeo, p.fecha_creacion; 
                --
            end
            else begin
                --
                select cast(0 as bit) as resultado, 'No existen acopios pendientes' as mensaje;
                --
            end;
            `;
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
    entregarAlAcopio: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
            set nocount on
            --
            if exists ( select * 
                        from k_paquetes as p with (nolock)
                        where p.id_paquete = ${ body.idpqt }
                          and exists ( select * 
                                       from k_paquetes_estado as es with (nolock) 
                                       where es.id_paquete = p.id_paquete 
                                         and es.estado = 300
                                         and es.usuario = ${ body.ficha } )
                          and not exists ( select * 
                                           from k_paquetes_estado as es with (nolock) 
                                           where es.id_paquete = p.id_paquete 
                                           and es.estado between 400 and 600 ) ) begin
                --
                declare @Error nvarchar(250),
                        @ErrMsg nvarchar(2048);
                begin try
                    --
                    insert into k_paquetes_estado (id_paquete,fecha,usuario,estado,comentario)
                                           values (${body.idpqt},getdate(),'${body.ficha}',400,'En bodega de acopio');
                    --
                    select cast(1 as bit) as resultado,'Encomienda entregada en acopio' as mensaje;
                end try
                begin catch
                    --
                    select cast(0 as bit) as resultado,'Encomienda no disponible para acopiar' as mensaje;
                    --
                end catch;
                --
            end
            else begin
                --
                select cast(0 as bit) as resultado,'Encomienda no disponible para acopiar' as mensaje;
                --
            end; 
        `;
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
    ciudades: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
                select ciudad from k_ciudades order by ciudad;
                `;
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
    tiposDePago: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
                select * from k_tipopago order by tipo_pago;
                `;
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
    grabarUsuario: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
                begin try
                if exists(select *
                        from k_usuarios as u with(nolock) where u.id = ${ body.xid }) begin
                    --
                    update k_usuarios set nombre = '${ body.xnomb}', email = '${ body.xmail}', clave = '${ body.xpssw }', rut = '${ body.xrut }', direccion = '${ body.xdirecc }', comuna = '${ body.xcomuna }', telefono = '${ body.xfono }', cargo = '${ body.xcargo }', vigente = '${ body.xvigente }', admin = '${ body.xadmin }'
                    where id = ${ body.xid };
                    --
                end
                else begin
                    --
                    insert into k_usuarios(nombre, email, clave, rut, direccion, comuna, telefono, cargo, vigente, admin)
                    values('${ body.xnomb}', '${ body.xmail}', '${ body.xpssw }', '${ body.xrut }', '${ body.xdirecc }', '${ body.xcomuna }', '${ body.xfono }', '${ body.xcargo }', '${ body.xvigente }', '${ body.xadmin}');
                    --
                end;
                --
                select cast(1 as bit) as resultado;
                --
                end try
                begin catch
                    select cast(0 as bit) as resultado;
                end catch;
                `;
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
    clientes: function(sql, body) {
        // console.log(body);
        // --------------------------------------------------------------------------------------------------
        var query = '';
        if (body.buscar !== '') {
            console.log(body.buscar, body.offset);
            query = "exec ksp_buscarClientes '" + body.buscar + "', " + body.offset + " ;";
        } else {
            query = 'SELECT top 50 * FROM k_clientes order by razon_social ;';
        }
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
    upClientes: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
                declare @Error nvarchar(250),
                        @ErrMsg nvarchar(2048);
                begin try
                if exists(select *
                        from k_clientes with(nolock) where id_cliente = ${ body.id_cliente }) begin
                    --
                    update k_clientes set rut = '${ body.rut }', razon_social = '${ body.razon_social}', nombre_fantasia = '${ body.nombre_fantasia}', direccion = '${ body.direccion}', ciudad = '${ body.ciudad}', comuna = '${ body.comuna}', referencias = '${ body.referencias}', email = '${ body.email}', telefono1 = '${ body.telefono1}', telefono2 = '${ body.telefono2}', tipo = '${ body.tipo}', lat = '${ body.lat}', lng = '${ body.lng}'
                    where id_cliente = ${ body.id_cliente };
                    --
                    set @Error = @@ERROR
                    if (@Error < > 0) begin
                        set @ErrMsg = ERROR_MESSAGE();
                        THROW @Error, @ErrMsg, 0;
                    end
                    --
                    select cast(1 as bit) as resultado, cast(0 as bit) as error, 'Grabado exitosamente!' as mensaje;
                    --
                end
                else begin
                    --
                    insert into k_clientes(rut, razon_social, nombre_fantasia, direccion, ciudad, comuna, referencias, email, telefono1, telefono2, tipo, lat, lng)
                    values('${ body.rut }', '${ body.razon_social}', '${ body.nombre_fantasia}', '${ body.direccion}', '${ body.ciudad}', '${ body.comuna}', '${ body.referencias}', '${ body.email}', '${ body.telefono1}', '${ body.telefono2}', '${ body.tipo}', '${ body.lat}', '${ body.lng}');
                    --
                    set @Error = @@ERROR
                    if (@Error < > 0) begin
                        set @ErrMsg = ERROR_MESSAGE();
                        THROW @Error, @ErrMsg, 0;
                    end
                    --
                    select cast(1 as bit) as resultado, cast(0 as bit) as error, 'Insertado exitosamente!' as mensaje;
                    --
                end;
                end try
                begin catch
                    --
                    if (@@TRANCOUNT > 0) rollback transaction;
                    select cast(0 as bit) as resultado, cast(1 as bit) as error, ERROR_MESSAGE() as mensaje;
                    --
                end catch;
                `;
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
    newEncomienda: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
                declare @id_pqt int,
                        @Error nvarchar(250),
                        @ErrMsg nvarchar(2048);
                begin try
                    if exists(select * from k_paquetes where id_paquete = ${ body.id_paquete }) begin
                        --
                        update k_paquetes set recepcionista = ${ body.recepcionista }, contacto = '${body.contacto}', fecha_prometida = '${body.fecha_prometida}', tipo_pago = '${body.tipo_pago}', valor_cobrado = ${ body.valor_cobrado }, obs_carga = '${body.obs_carga}', numero_legal = '${body.numero_legal}', bultos = ${ body.bultos }, peso = ${ body.peso }, volumen = ${ body.volumen }
                        where id_paquete = ${ body.id_paquete };
                        --
                        select cast(1 as bit) as resultado, cast(0 as bit) as error, 'Actualizado exitosamente!'
                        as mensaje, ${ body.id_paquete }
                        as id_pqt;
                        --
                    end
                else begin
                    --
                    begin transaction;
                    --
                    insert into k_paquetes(recepcionista, fecha_creacion, cliente, contacto, fecha_prometida, tipo_pago, valor_cobrado, obs_carga, documento_legal, numero_legal, bultos, peso, volumen, destinatario)
                    values(${ body.recepcionista }, '${body.fecha_creacion.substring(0,10)}', ${ body.cliente }, '${body.contacto}', '${body.fecha_prometida}', '${body.tipo_pago}', ${ body.valor_cobrado }, '${body.obs_carga}', '${body.documento_legal}', '${body.numero_legal}', ${ body.bultos }, ${ body.peso }, ${ body.volumen }, ${ body.destinatario });
                    --
                    set @Error = @@ERROR
                    if (@Error < > 0) begin
                        set @ErrMsg = ERROR_MESSAGE();
                        THROW @Error, @ErrMsg, 0;
                    end
                    --
                    select @id_pqt = @@IDENTITY;
                    --
                    insert into k_paquetes_estado(id_paquete, fecha, usuario, comentario, estado)
                    values(@id_pqt, getdate(), ${ body.recepcionista }, 'Ingreso al sistema', '100');
                    --
                    commit transaction;
                    --
                    select cast(1 as bit) as resultado, cast(0 as bit) as error, 'Insertado exitosamente!'
                    as mensaje, @id_pqt as id_pqt;
                --
                end;
                end try
                begin catch
                    --
                    if (@@TRANCOUNT > 0) rollback transaction;
                    select cast(0 as bit) as resultado, cast(1 as bit) as error, ERROR_MESSAGE() as mensaje;
                    --
                end catch;
                `;
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
    borrarEncomienda: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
                declare @id_pqt int,
                        @Error nvarchar(250),
                        @ErrMsg nvarchar(2048);
                begin try
                    if exists(select * from k_paquetes where id_paquete = ${ body.id_pqt }) begin
                    --
                    delete from k_paquetes where id_paquete = ${ body.id_pqt };
                    delete from k_paquetes_estado where id_paquete = ${ body.id_pqt };
                    --
                    set @Error = @@ERROR
                    if (@Error < > 0) begin
                        set @ErrMsg = ERROR_MESSAGE();
                        THROW @Error, @ErrMsg, 0;
                    end
                    --
                    select cast(1 as bit) as resultado, cast(0 as bit) as error, 'Borrado exitosamente!' as mensaje;
                    --
                end
                else begin
                    --
                    select cast(0 as bit) as resultado, cast(1 as bit) as error, 'La encomienda no existe!' as mensaje;
                    --
                end;
                end try
                begin catch
                    --
                    select cast(0 as bit) as resultado, cast(1 as bit) as error, ERROR_MESSAGE() as mensaje;
                    --
                end catch;
                `;
        // console.log(query);
        // --------------------------------------------------------------------------------------------------
        var request = new sql.Request();
        //
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
    },
    // consulta externa desde otra pagina web   
    dondeEstas: function(sql, body) {
        // vienes desde afuera o es una consulta normal?
        let query;
        if (body.interno === undefined) {
            query = `
                with 
                ingreso as ( select id_paquete,fecha,usuario from k_paquetes_estado with (nolock) where id_paquete=${ body.idpqt } and estado=100 ),
                retiro  as ( select id_paquete,fecha,usuario from k_paquetes_estado with (nolock) where id_paquete=${ body.idpqt } and estado=300 ),
                acopio  as ( select id_paquete,fecha,usuario from k_paquetes_estado with (nolock) where id_paquete=${ body.idpqt } and estado=400 ),
                entrega as ( select top 1 id_paquete,fecha,usuario from k_paquetes_estado with (nolock) where id_paquete=${ body.idpqt } and estado in (900,950) )
                SELECT top 1 elpqt.id_paquete
                        ,'Ingreso al Sistema' as aingreso
                        ,coalesce(convert(nvarchar(10), ing.fecha, 103 ),'') as fingreso
                        ,convert(nvarchar(5), ing.fecha, 108) as hingreso
                        ,(select nombre from k_usuarios as ux with (nolock) where ing.usuario = ux.id) as uingreso
                        ,'Encomienda retirada' as aretiro
                        ,coalesce(convert(nvarchar(10), ret.fecha, 103 ),'') as fretiro
                        ,convert(nvarchar(5), ret.fecha, 108) as hretiro
                        ,(select nombre from k_usuarios as ux with (nolock) where ret.usuario = ux.id) as uretiro
                        ,'En bodega de acopio' as aacopio
                        ,coalesce(convert(nvarchar(10), aco.fecha, 103 ),'') as facopio
                        ,convert(nvarchar(5), aco.fecha, 108) as hacopio
                        ,(select nombre from k_usuarios as ux with (nolock) where aco.usuario = ux.id) as uacopio
                        ,'Entregado en destino' as aentrega
                        ,coalesce(convert(nvarchar(10), ent.fecha, 103 ),'') as fentrega
                        ,convert(nvarchar(5), ent.fecha, 108) as hentrega
                        ,(select nombre from k_usuarios as ux with (nolock) where ent.usuario = ux.id) as uentrega
                        ,convert(nvarchar(10), elpqt.fecha_prometida, 103) as fprometida
                        --,'Prometida de entrega: '+convert(nvarchar(10), elpqt.fecha_prometida, 103) as fecha
                FROM k_paquetes as elpqt with (nolock)
                left join ingreso as ing with (nolock) on elpqt.id_paquete = ing.id_paquete 
                left join retiro  as ret with (nolock) on elpqt.id_paquete = ret.id_paquete
                left join acopio  as aco with (nolock) on elpqt.id_paquete = aco.id_paquete
                left join entrega as ent with (nolock) on elpqt.id_paquete = ent.id_paquete
                where elpqt.id_paquete = ${ body.idpqt };
                `;
        } else {
            query = `
                SELECT top 1 pqt.id, elpqt.id_paquete
                            ,elpqt.fecha_prometida as fecha_entera
                            ,'Fecha Prometida: '+convert(nvarchar(10), elpqt.fecha_prometida, 103) as fecha
                            ,convert(nvarchar(5), pqt.fecha, 108) as hora
                            ,pqt.estado, pqt.comentario, pqt.usuario, usuario.nombre
                FROM k_paquetes as elpqt with (nolock)
                inner join k_paquetes_estado as pqt with (nolock) on elpqt.id_paquete = pqt.id_paquete and pqt.estado=100
                left join k_usuarios as usuario on pqt.usuario = usuario.id
                where elpqt.id_paquete = ${ body.idpqt }
                union 
                SELECT pqt.id, pqt.id_paquete
                    ,pqt.fecha as fecha_entera
                    ,'Fecha Movim.: '+convert(nvarchar(10), pqt.fecha, 103) as fecha
                    ,convert(nvarchar(5), pqt.fecha, 108) as hora
                    ,pqt.estado, pqt.comentario, pqt.usuario, usuario.nombre
                FROM k_paquetes_estado as pqt with (nolock)
                inner join k_paquetes as elpqt with (nolock) on elpqt.id_paquete = pqt.id_paquete and pqt.estado<>100
                left join k_usuarios as usuario on pqt.usuario = usuario.id
                where pqt.id_paquete = ${ body.idpqt }
                order by pqt.id desc;
                `;
        }
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
    Estados: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
                SELECT k_estados.*, cast(0 as bit) as anterior, cast(0 as bit) as id_estado, cast(0 as bit) as marcada, cast(0 as int) as usuario, cast(null as datetime) as fecha_entera, cast(''
                    as varchar(50)) as nombre
                FROM k_estados order by estado;
                `;
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
    updateEstados: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        let cerrarID = false;
        let ms = 0;
        let q2 = '';
        //
        let query = `
            declare @id_pqt int,
            @Error nvarchar(250),
                @ErrMsg nvarchar(2048);
            begin try
                begin transaction;
                -- -------------------------------------------------- cierre de encomienda ?
                    if (${ body.cierre === false ? 0 : 1 } = 1) begin
                        --
                        update k_paquetes
                        set fecha_cierre = getdate()
                        where id_paquete = ${ body.id_paquete };
                        --
                        set @Error = @@ERROR
                        if (@Error < > 0) begin
                            set @ErrMsg = ERROR_MESSAGE();
                            THROW @Error, @ErrMsg, 0;
                        end
                    end;
                    ###estados###
                -- --------------------------------------------------
                commit transaction;
                --
                select cast(1 as bit) as resultado, cast(0 as bit) as error, 'Actualizado exitosamente!' as mensaje, ${ body.id_paquete } as id_pqt;
                --
            end try
            begin catch
                --
                if (@@TRANCOUNT > 0) rollback transaction;
                select cast(0 as bit) as resultado, cast(1 as bit) as error, ERROR_MESSAGE() as mensaje;
                --
            end catch;
            `;
        // console.log(query);
        // ------------------------------ estados por cierre
        body.estados.forEach(elem => {
            if (elem.marcada === true) {
                ms += 10;
                if (elem.anterior === true) {
                    q2 += `
                if exists( select *
                           from k_paquetes_estado with(nolock)
                           where id = ${ elem.id_estado }
                             and usuario < > ${ elem.usuario }) begin
                    --
                    update k_paquetes_estado
                    set usuario = ${ elem.usuario }, fecha = dateadd(ms, ${ ms }, getdate())
                    where id = ${ elem.id_estado };
                    --
                    set @Error = @@ERROR
                    if (@Error < > 0) begin
                        set @ErrMsg = ERROR_MESSAGE();
                        THROW @Error, @ErrMsg, 0;
                    end
                    --
                end;
                `;
                } else {
                    q2 += `
                --
                insert into k_paquetes_estado(id_paquete, fecha, usuario, comentario, estado)
                values(${ body.id_paquete }, dateadd(ms, ${ ms }, getdate()), ${ elem.usuario }, '${elem.descripcion}', ${ elem.estado });
                --
                set @Error = @@ERROR
                if (@Error < > 0) begin
                    set @ErrMsg = ERROR_MESSAGE();
                    THROW @Error, @ErrMsg, 0;
                end
                --
                `;
                    if (elem.estado === 350 || elem.estado === 950 || elem.estado === 960) {
                        cerrarID = true;
                    }
                }
            }
        });
        // console.log(q2);
        // ------------------------------ estados por update
        if (cerrarID === true && body.cierre === false) {
            q2 += `
                update k_paquetes
                set fecha_cierre = getdate()
                where id_paquete = ${ body.id_paquete };
                --
                set @Error = @@ERROR
                if (@Error < > 0) begin
                    set @ErrMsg = ERROR_MESSAGE();
                    THROW @Error, @ErrMsg, 0;
                end
                --
                `;
        }
        // console.log(q2);
        //
        query = query.replace('###estados###', q2);
        //
        console.log(body.id_paquete, query);
        // --------------------------------------------------------------------------------------------------
        var request = new sql.Request();
        //
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
    },

    dameMasivos: function(sql, body) {
        var query = `
        if exists ( select * 
                    from k_paquetes as p with (nolock) 
                    where p.id_paquete between ${body.idIni} and ${body.idFin} ##cliente## ##destinatario## ) begin
            with ids
            as ( SELECT e.id_paquete,max(e.fecha) as fecha
                    FROM k_paquetes_estado as e with (nolock)
                    GROUP BY e.id_paquete ),
            estados 
            as ( select e.*, us.nombre
                    FROM k_paquetes_estado as e with (nolock)
                    inner join ids as i on i.id_paquete = e.id_paquete and i.fecha = e.fecha
                    left join k_usuarios as us with (nolock) on us.id = e.usuario )
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                    p.id_paquete,p.cliente,p.destinatario,
                    p.obs_carga,p.tipo_pago,
                    convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion,
                    cli.razon_social as cli_razon, des.razon_social as des_razon,
                    coalesce(est.comentario,'PENDIENTE') as estado
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            left join estados    as est on est.id_paquete = p.id_paquete
            where p.id_paquete between ${body.idIni} and ${body.idFin} ##cliente## ##destinatario##
            order by p.id_paquete, p.orden_de_pickeo  ;
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen encomiendas entre los parámetros ingresados' as mensaje;
            --
        end;
        `;
        if (body.idCliente === 0) {
            query = query.replace('##cliente##', '');
            query = query.replace('##cliente##', '');
        } else {
            query = query.replace('##cliente##', ` and p.cliente = ${body.idCliente} `);
            query = query.replace('##cliente##', ` and p.cliente = ${body.idCliente} `);
        }
        if (body.idDestina === 0) {
            query = query.replace('##destinatario##', '');
            query = query.replace('##destinatario##', '');
        } else {
            query = query.replace('##destinatario##', ` and p.destinatario = ${body.idDestina} `);
            query = query.replace('##destinatario##', ` and p.destinatario = ${body.idDestina} `);
        }
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
    dameEncomiendas: function(sql, body) {
        var query = `
        --
        declare @fi date = cast( '${body.fechaIni}' as date),
                @ff date = cast( '${body.fechaFin}' as date );
        --
        if exists ( select * 
                    from k_paquetes as p with (nolock) 
                    where ##casofiltro## ##cliente## ##destinatario## ) begin
            with ids
            as ( SELECT e.id_paquete,max(e.fecha) as fecha
                    FROM k_paquetes_estado as e with (nolock)
                    GROUP BY e.id_paquete ),
            estados 
            as ( select e.*, us.nombre
                    FROM k_paquetes_estado as e with (nolock)
                    inner join ids as i on i.id_paquete = e.id_paquete and i.fecha = e.fecha
                    left join k_usuarios as us with (nolock) on us.id = e.usuario )
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                    p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                    p.numero_legal,p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                    convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(5),p.fecha_creacion,108) as hora_creacion, 
                    convert( nvarchar(10),p.fecha_prometida,103) as fecha_prometida,CONVERT(varchar(10), p.fecha_prometida,126) as llegada,
                    cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                    cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                    coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                    des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                    des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                    coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                    convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion,
                    coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador,
                    p.documento_legal,p.numero_legal 
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            left join estados    as est on est.id_paquete = p.id_paquete
            where ##casofiltro## ##cliente## ##destinatario##
            order by p.fecha_creacion, p.orden_de_pickeo  ;
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen encomiendas entre los parámetros ingresados' as mensaje;
            --
        end;
        `;
        if (body.filtro === 'fecha') {
            query = query.split('##casofiltro##').join(` p.fecha_creacion between @fi and @ff `);
        } else {
            query = query.split('##casofiltro##').join(` p.id_paquete between '${body.idIni}' and '${body.idFin}' `);
        }
        if (body.idCliente === 0) {
            query = query.split('##cliente##').join('');
        } else {
            query = query.split('##cliente##').join(` and p.cliente = ${body.idCliente} `);
        }
        if (body.idDestina === 0) {
            query = query.split('##destinatario##').join('');
        } else {
            query = query.split('##destinatario##').join(` and p.destinatario = ${body.idDestina} `);
        }
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
    dameEncomiendasbyID: function(sql, body) {
        var query = `
        if exists ( select * 
                    from k_paquetes as p with (nolock)
                    where p.id_paquete between '${body.idIni}' and '${body.idFin}' ) begin
            with ids
            as ( SELECT e.id_paquete,max(e.fecha) as fecha
                    FROM k_paquetes_estado as e with (nolock)
                    GROUP BY e.id_paquete ),
            estados 
            as ( select e.*, us.nombre
                    FROM k_paquetes_estado as e with (nolock)
                    inner join ids as i on i.id_paquete = e.id_paquete and i.fecha = e.fecha
                    left join k_usuarios as us with (nolock) on us.id = e.usuario )
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                    p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                    p.numero_legal,p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                    convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(5),p.fecha_creacion,108) as hora_creacion, 
                    convert( nvarchar(10),p.fecha_prometida,103) as fecha_prometida,CONVERT(varchar(10), p.fecha_prometida,126) as llegada,
                    cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                    cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                    coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                    des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                    des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                    coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                    convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion,
                    coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador,
                    p.documento_legal,p.numero_legal 
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            left join estados    as est on est.id_paquete = p.id_paquete
            where p.id_paquete between '${body.idIni}' and '${body.idFin}'
            order by p.fecha_creacion, p.orden_de_pickeo  ;
        end
        else begin
            --
            select cast(0 as bit) as resultado,'No existen encomiendas entre los parámetros ingresados' as mensaje;
            --
        end;
        `;
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
    entregaPendienteWeb: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
        --
        with ids as ( select e.id_paquete,max(e.fecha) as fecha
                    from k_paquetes_estado as e with (nolock)
                    group BY e.id_paquete ),
        estados as ( select e.*, us.nombre
                    from k_paquetes_estado as e with (nolock)
                    inner join ids as i on i.id_paquete = e.id_paquete and i.fecha = e.fecha
                    left join k_usuarios as us with (nolock) on us.id = e.usuario )
        select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje, cast(0 as bit) as marcado, 
                p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                p.obs_carga,p.obs_pickeo,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(8),p.fecha_creacion,108) as hora_creacion, 
                convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion,
                coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador,
                p.documento_legal,p.numero_legal 
        from k_paquetes as p
        left join k_clientes as cli on cli.id_cliente=p.cliente
        left join k_clientes as des on des.id_cliente=p.destinatario
        left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
        left join estados    as est on est.id_paquete = p.id_paquete
        where exists ( select * 
                    from k_paquetes_estado as es with (nolock) 
                    where es.id_paquete = p.id_paquete 
                    and es.estado = 400 )
        and not exists ( select * 
                        from k_paquetes_estado as es with (nolock) 
                        where es.id_paquete = p.id_paquete 
                            and es.estado between 420 and 600 ) 
        order by p.orden_de_pickeo, p.fecha_creacion ;`;
        // --------------------------------------------------------------------------------------------------
        // console.log(query);
        var request = new sql.Request();
        //
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
    },
    //
    entregaPendiente: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
            with yalistas 
            as (select p.id_paquete 
                from k_paquetes as p with (nolock) 
                where not exists (select *
                                from k_paquetes_estado as es with (nolock) 
                                where es.id_paquete = p.id_paquete
                                    and es.estado in (450,950,960 ) )
                and exists ( select *
                            from k_paquetes_estado as es with (nolock) 
                            where es.id_paquete = p.id_paquete
                                and es.estado between 400 and 800 ) )
            select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje, cast(0 as bit) as marcado, 
                    p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,
                    p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                    convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(8),p.fecha_creacion,108) as hora_creacion, 
                    convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                    cli.razon_social as cli_razon,cli.direccion as cli_direccion,des.razon_social as des_razon,
                    des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                    des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                    p.recep_obs,p.recep_nombre,p.recep_rut,p.recep_obs,p.recep_parentezco,
                    p.documento_legal,p.numero_legal 
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            where exists ( select * 
                            from yalistas as ya
                            where ya.id_paquete = p.id_paquete  )
            order by p.orden_de_pickeo, p.fecha_creacion ;
        `;
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
    paqueteEntregado: function(sql, body) {
        //
        const obs = (body.obs === undefined) ? '' : body.obs;
        const nombre = (body.receptor === undefined) ? '' : body.receptor;
        const rut = (body.rut === undefined) ? '' : body.rut;
        const relacion = (body.relacion === undefined) ? '' : body.relacion;
        // --------------------------------------------------------------------------------------------------
        const query = `
            --
            declare @Error	nvarchar(250) , 
                    @ErrMsg	nvarchar(2048); 
            --
            begin try 
                if exists ( select * 
                            from k_paquetes as p with (nolock)
                            where p.id_paquete = ${ body.id_pqt } ) begin
                    begin transaction
                        --
                        update k_paquetes set recep_obs       = '${ obs }', 
                                              recep_nombre    = '${ nombre }', 
                                              recep_rut       = '${ rut }', 
                                              recep_parentezco= '${ relacion }'
                        where id_paquete = ${ body.id_pqt };
                        -- sin problemas
                        if ( ${ body.problema === true ? 1 : 0 } = 0 ) begin
                            --
                            insert into k_paquetes_estado (id_paquete,usuario,fecha,comentario,estado)
                            values ( ${ body.id_pqt }, ${ body.ficha }, getdate(), 'Cierre Exitoso', 950 );
                            --
                        end
                        -- con dramas
                        else begin
                            --
                            insert into k_paquetes_estado (id_paquete,usuario,fecha,estado,comentario)
                            values ( ${ body.id_pqt }, ${ body.ficha }, getdate(), ${ body.queprobl }, ( select top 1 descripcion from k_estados where estado = ${ body.queprobl } ) );
                            --
                        end;
                        --
                    commit transaction
                    --
                    select cast(1 as bit) as resultado,cast(0 as bit) as error, 'Entregado exitosamente!' as mensaje;
                    --
                end
                else begin
                    --
                    select cast(0 as bit) as resultado,cast(1 as bit) as error,'Encomienda no Existe' as mensaje;
                    --
                end; 
            end try
            begin catch
                --
                set @Error = @@ERROR
                set @ErrMsg = ERROR_MESSAGE();
                --
                if (@@TRANCOUNT > 0 ) rollback transaction;
                --
                select cast(0 as bit) as resultado,cast(1 as bit) as error,ERROR_MESSAGE() as mensaje;
            end catch; 
        `;
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
    PDFDoc: function(encomienda) {
        //
        return new Promise((resolve, reject) => {

            xhoy = new Date();
            hora = xhoy.getHours().toString();
            minu = xhoy.getMinutes().toString();
            // shortname = 'GDV.pdf';
            shortname = `ENC_${ enca.folio.toString() }_${ enca.nroint.toString() }_${ hora }_${ minu }.pdf`;
            filename = path.join(CARPETA_PDF, shortname);
            //
            console.log('filename -> ', filename);
            //
            var contenido = `                       
                            <html>
                                <head>
                                    <meta charset="utf-8">
                                    <style>
                                        html, body { font-size: 14px; }
                                        table { width: 100%; font-size: 7px;  }
                                        thead { color: white; background: #565252; }
                                        tbody { color: black; }
                                        td,th { border: 1px; padding: 5px; }
                                        tfoot { color: red; }
                                    </style>
                                </head>
                                <body>
                                    <h3 style="text-align: center;">${ enca.descconcepto }</h3>
                                    <h3 style="text-align: center;">Folio : ${ enca.folio } - Nro.Interno : ${ enca.nroint }</h3>
                                    <hr><br>
                                    <!-- encabezado -->
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td width="15%" align="left">Local</td>
                                                <td width="40%" align="left" style="font-weight: bold;">${ enca.nomlocal }</td width="15%" align="left">
                                                <td width="15%" align="right">Fecha : </td>
                                                <td width="15%" align="left" style="font-weight: bold;">${ enca.fecha }</td>
                                                <td>&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td width="15%" align="left">Centro de Costo</td>
                                                <td width="60%" align="left" style="font-weight: bold;">${ enca.ccosto }</td>
                                                <td width="15%" align="right">Usuario : </td>
                                                <td width="15%" align="left" style="font-weight: bold;">${ enca.usuario }</td>
                                                <td>&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td width="15%" align="left">Glosa</td>
                                                <td width="60%" align="left" style="font-weight: bold;">${ enca.glosa }</td>
                                                <td>&nbsp;</td>
                                                <td>&nbsp;</td>
                                                <td>&nbsp;</td>
                                            </tr>                                            
                                        </tbody>
                                    </table>
                                    <!--  -->
                                    <br>
                                    <!-- detalle -->
                                    <table>
                                        <thead style="color:white;background: #565252;">
                                            <tr>
                                                <th width="12%" align="left">Código</th>
                                                <th width="49%" align="left">Producto</th>
                                                <th width="9%" align="right">Cantidad</th>
                                                <th width="5%" align="left">Unidad</th>
                                                <th width="10%" align="right">Precio</th>
                                                <th width="15%" align="right">SubTotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        `;
            var linea = 0;
            deta.forEach(element => {
                ++linea;
                contenido += `
                                            <tr>
                                                <td width="12%" align="left" >${ element.codigo      }</td>
                                                <td width="49%" align="left" >${ element.descripcion }</td>
                                                <td width="9%" align="right" >${ element.cantidad    }</td>
                                                <td width="5%" align="left"  >${ element.unidad      }</td>
                                                <td width="10%" align="right">n/a</td>
                                                <td width="15%" align="right">n/a</td>
                                            </tr>
                            `;
            });
            contenido += `
                                        </tbody>
                                                         
                                    </table>
                                </body>
                            </html>
                            `;
            // 
            // console.log(contenido);
            //
            var options = {
                "height": "10cm", // allowed units: mm, cm, in, px
                "width": "7cm", // allowed units: mm, cm, in, px
                "type": "pdf", // allowed file types: png, jpeg, pdf
                "header": { "height": "2mm" },
                "footer": { "height": "2mm" }
            };
            pdfs.create(contenido, options)
                .toFile(filename,
                    function(err, res) {
                        if (err) {
                            reject('error');
                            console.log(err);
                        } else {
                            console.log(res);
                            resolve(shortname);
                        }
                    });
        });
    },
    //
    unaEncomienda: function(sql, body) {
        console.log(body);
        // --------------------------------------------------------------------------------------------------
        var query = `
            if exists ( select * 
                        from k_paquetes as p with (nolock)
                        where id_paquete = ${ body.idpqt } ) begin
                --
                select cast(1 as bit) as resultado, cast(0 as bit) as error,'' as mensaje,
                        p.id_paquete,p.orden_de_pickeo,p.cliente,p.destinatario,coalesce(p.contacto,'(no informado)') as contacto,
                        p.obs_carga,p.peso,p.volumen,p.bultos,p.valor_cobrado,p.tipo_pago,tp.descripcion as desc_pago,
                        convert( nvarchar(10),p.fecha_creacion,103) as fecha_creacion, convert( nvarchar(8),p.fecha_creacion,108) as hora_creacion, 
                        convert( nvarchar(10),fecha_prometida,103) as fecha_prometida,
                        cli.rut as cli_rut,cli.razon_social as cli_razon,cli.nombre_fantasia as cli_fantasia,
                        cli.direccion as cli_direccion,cli.ciudad as cli_ciudad,cli.comuna as cli_comuna,
                        coalesce(cli.referencias,'(sin referencias)') as cli_referencias,cli.telefono1 as cli_fono1,cli.telefono2 as cli_fono2,
                        des.rut as des_rut,des.razon_social as des_razon,des.nombre_fantasia as des_fantasia,
                        des.direccion as des_direccion,des.ciudad as des_ciudad,des.comuna as des_comuna,
                        coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2,
                        p.documento_legal,p.numero_legal  
                from k_paquetes as p
                left join k_clientes as cli on cli.id_cliente=p.cliente
                left join k_clientes as des on des.id_cliente=p.destinatario
                left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago
                where p.id_paquete = ${ body.idpqt } ;
            --
            end
            else begin
                --
                select cast(0 as bit) as resultado,'No existe encomienda señalada' as mensaje;
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
    volverACalcular: function(body) {
        // 
        return new Promise((resolve) => {
            // 
            const unMillon = 1000000;
            const minimo = 4000;
            const valorPallet = 60000;
            const valorIVA = 1.0;
            // 
            if (body.bulto === 'bulto') {
                console.log('bulto');
                // 
                const mt3 = (body.alto * body.ancho * body.largo) / unMillon;
                let valorXbulto = mt3 * 165 * 380;
                valorXbulto = Math.round(((valorXbulto < minimo) ? minimo : valorXbulto) * valorIVA);
                // 
                if (body.peso <= 100) {
                    const valorXpeso = Math.round((body.peso * 120) * valorIVA);
                    resolve(valorXbulto > valorXpeso ? valorXbulto : valorXpeso);

                } else if (body.peso > 100 && body.peso <= 300) {
                    const valorXpeso = Math.round((body.peso * 100) * valorIVA);
                    resolve(valorXbulto > valorXpeso ? valorXbulto : valorXpeso);

                } else if (body.peso > 300 && body.peso < 999999) {
                    const valorXpeso = Math.round((body.peso * 80) * valorIVA);
                    resolve(valorXbulto > valorXpeso ? valorXbulto : valorXpeso);
                }
                // 
            } else {
                // 
                const valorXpallet = Math.round((body.pallet * valorPallet) * valorIVA);
                resolve(valorXpallet);
                // 
            }
            // 
        });
    },
    cambiarPrecio: function(sql, body) {
        //
        const query = `
            --
            declare @Error	nvarchar(250) , 
                    @ErrMsg	nvarchar(2048); 
            --
            begin try 
                if exists ( select * 
                            from k_paquetes as p with (nolock)
                            where p.id_paquete = ${ body.id_pqt } ) begin
                    --
                    update k_paquetes set valor_cobrado = ${ body.precio }, peso = ${ body.peso }, volumen = ${ body.volumen }
                    where id_paquete = ${ body.id_pqt };
                    --
                    select cast(1 as bit) as resultado,cast(0 as bit) as error, 'Precio actualizado!' as mensaje;
                    --
                end
                else begin
                    --
                    select cast(0 as bit) as resultado,cast(1 as bit) as error,'Encomienda no Existe' as mensaje;
                    --
                end; 
            end try
            begin catch
                --
                set @Error = @@ERROR
                set @ErrMsg = ERROR_MESSAGE();
                --
                if (@@TRANCOUNT > 0 ) rollback transaction;
                --
                select cast(0 as bit) as resultado,cast(1 as bit) as error,ERROR_MESSAGE() as mensaje;
            end catch; 
        `;
        console.log(query);
        // --------------------------------------------------------------------------------------------------
        var request = new sql.Request();
        //
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
        // 
    },

};