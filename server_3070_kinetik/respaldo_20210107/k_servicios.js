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
                convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion, coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador 
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
                    convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion, coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador 
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
                        coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2 
                from k_paquetes as p
                left join k_clientes as cli on cli.id_cliente=p.cliente
                left join k_clientes as des on des.id_cliente=p.destinatario
                left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago
                where p.fecha_cierre is null
                    and not exists ( select * 
                                    from k_paquetes_estado as es with (nolock) 
                                    where es.id_paquete = p.id_paquete 
                                        and es.estado = 200 )
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
                        coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2 
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
                order by p.orden_de_pickeo, p.fecha_creacion ;
                --
            end
            else begin
                --
                select cast(0 as bit) as resultado,'No existen encomiendas pendientes' as mensaje;
                --
            end; 
        `;
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
    saveIMG: function(sql, ib64, extension, id_pqt) {
        // 
        var query = `
            insert into k_paquetes_img ( id_paquete, fechains, img_exten, img_name ) 
            values ( ${ id_pqt }, getdate(), '${ extension }', '${ ib64 }' ) ;`;
        console.log('saveIMG', query);
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
                select top 1 'ok' as resultado, img_name as imgb64 from k_paquetes_img with (nolock) where id_paquete = ${ body.id_pqt }
            end
            else begin
                select 'nodata' as resultado
            end; 
        `;

        console.log(query);
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
                convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion, coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador 
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
        console.log(query);
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
                        coalesce(des.referencias,'(sin referencias)') as des_referencias,des.telefono1 as des_fono1,des.telefono2 as des_fono2 
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
                        convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion, coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador 
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
    clientes: function(sql, body) {
        console.log(body);
        // --------------------------------------------------------------------------------------------------
        var query = '';
        if (body.buscar !== '') {
            console.log(body.buscar, body.offset);
            query = "exec ksp_buscarClientes '" + body.buscar + "', " + body.offset + " ;";
        } else {
            query = 'SELECT top 50 * FROM k_clientes order by razon_social ;';
        }
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
    dondeEstas: function(sql, body) {
        // --------------------------------------------------------------------------------------------------
        const query = `
                SELECT pqt.id, pqt.id_paquete, pqt.fecha as fecha_entera, convert(nvarchar(10), pqt.fecha, 103) as fecha, convert(nvarchar(5), pqt.fecha, 108) as hora, pqt.estado, pqt.comentario, pqt.usuario, usuario.nombre
                FROM k_paquetes_estado as pqt
                left join k_usuarios as usuario on pqt.usuario = usuario.id
                where pqt.id_paquete = ${ body.idpqt }
                order by pqt.id desc;
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
    dameEncomiendas: function(sql, body) {
        var query = `
        if exists ( select * 
                    from k_paquetes as p with (nolock) 
                    where p.fecha_creacion between '${body.fechaIni}' and '${body.fechaFin}' ##cliente## ##destinatario## ) begin
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
                    convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion, coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador 
            from k_paquetes as p
            left join k_clientes as cli on cli.id_cliente=p.cliente
            left join k_clientes as des on des.id_cliente=p.destinatario
            left join k_tipopago as tp  on tp.tipo_pago=p.tipo_pago 
            left join estados    as est on est.id_paquete = p.id_paquete
            where p.fecha_creacion between '${body.fechaIni}' and '${body.fechaFin}' ##cliente## ##destinatario##
            order by p.fecha_creacion, p.orden_de_pickeo  ;
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
                    convert( nvarchar(10),est.fecha,103) as asignacion,convert( nvarchar(5),est.fecha,108) as hora_asignacion, coalesce(est.comentario,'PENDIENTE') as estado, coalesce(est.nombre,'n/a') as pickeador 
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