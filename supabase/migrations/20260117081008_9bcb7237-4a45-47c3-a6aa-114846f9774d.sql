-- Enable realtime for delivery_settings and stock_status
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_status;