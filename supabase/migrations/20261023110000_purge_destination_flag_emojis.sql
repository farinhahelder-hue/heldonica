-- 20261023110000_purge_destination_flag_emojis.sql
-- Purge des drapeaux emojis dans destinations conformément à la charte carnet de route
-- et au garde-fou check-design-tics (interdiction des Regional Indicator Symbols \u{1F1E6}-\u{1F1FF}).

UPDATE public.destinations
SET flag_emoji = NULL
WHERE flag_emoji IS NOT NULL;
