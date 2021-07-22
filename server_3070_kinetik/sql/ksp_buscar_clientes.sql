 
-- exec ksp_buscarClientes 'caro',0;
IF OBJECT_ID('ksp_buscarClientes', 'P') IS NOT NULL  
    DROP PROCEDURE ksp_buscarClientes;  
GO  
CREATE PROCEDURE ksp_buscarClientes ( @codigo varchar(50), @offset int ) 
With Encryption
AS
BEGIN
 
    SET NOCOUNT ON;
 
    declare @kodigo     varchar(200);
    declare @deskri     varchar(200);
    declare @descri     varchar(200);
    declare @direcc     varchar(200), @direc2 vaRCHAR(200), @direc3 vaRCHAR(200);
    declare @comuna     varchar(200), @comun2 varchar(200), @comun3 varchar(200);
    declare @query      NVARCHAR(2500);
    declare @xkoen      varchar(500);
    declare @xnokoen    varchar(500);
    declare @xmarca     varchar(500);
 
    set @codigo = RTRIM(@codigo);
    set @descri = RTRIM(@codigo);
    set @direcc = RTRIM(@codigo);
    set @comuna = RTRIM(@codigo);
	 
    set @query   = 'select *';
    set @query  += 'FROM k_clientes AS EN WITH (NOLOCK) ';
 
    -- pasadas por ksp_cambiatodo
    exec ksp_cambiatodo @codigo, @salida = @kodigo OUTPUT ;
    exec ksp_cambiatodo @descri, @salida = @deskri OUTPUT ;
    exec ksp_cambiatodo @descri, @salida = @direc2 OUTPUT ;
    exec ksp_cambiatodo @descri, @salida = @comun2 OUTPUT ;
	--
    set @kodigo = case when @kodigo<>'' then '%'+@kodigo+'%' else '' end;
    set @deskri = case when @deskri<>'' then '%'+@deskri+'%' else '' end;
    set @direc2 = case when @direc2<>'' then '%'+@direc2+'%' else '' end;
    set @comun2 = case when @comun2<>'' then '%'+@comun2+'%' else '' end;
     --
    exec ksp_TipoGoogle 'EN.rut',         @kodigo, @salida = @xkoen   output;
    exec ksp_TipoGoogle 'EN.razon_social',@deskri, @salida = @xnokoen output;
    exec ksp_TipoGoogle 'EN.direccion',   @deskri, @salida = @direc3 output;
    exec ksp_TipoGoogle 'EN.comuna',      @deskri, @salida = @comun3 output;
    --
    set @query = concat( @query, ' WHERE ( ', @xkoen, ' ) OR ( ',  @xnokoen, ' ) OR ( ',  @direc3, ' ) OR ( ',  @comun3, ' ) ORDER BY EN.razon_social ' ); 
    EXECUTE sp_executesql @query;
	--
END;
GO
