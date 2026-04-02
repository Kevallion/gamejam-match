-- Backfill: remplir team_id depuis le champ link pour les anciennes notifications
-- qui n'ont pas encore les colonnes FK remplies.

-- 1. team_id depuis `/teams/{uuid}` (inclut /teams/{uuid}/manage)
UPDATE public.notifications n
SET team_id = (regexp_match(
  n.link,
  '/teams/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'
))[1]::uuid
WHERE n.team_id IS NULL
  AND n.link ~ '/teams/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
  AND n.type IN (
    'application_accepted',
    'application_declined',
    'invitation_declined',
    'player_joined',
    'team_chat',
    'discord_updated',
    'team_kicked'
  );

-- 2. join_request_id depuis `highlightRequest={uuid}` (application_received)
UPDATE public.notifications n
SET join_request_id = (regexp_match(
  n.link,
  'highlightRequest=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'
))[1]::uuid
WHERE n.join_request_id IS NULL
  AND n.link ~ 'highlightRequest=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
  AND n.type = 'application_received';

-- 3. join_request_id depuis `/invitation/{uuid}` (team_invitation)
UPDATE public.notifications n
SET join_request_id = (regexp_match(
  n.link,
  '/invitation/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'
))[1]::uuid
WHERE n.join_request_id IS NULL
  AND n.link ~ '/invitation/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
  AND n.type = 'team_invitation';

-- 4. sender_id depuis teams.user_id pour les types où l'acteur = propriétaire d'équipe
--    (maintenant que team_id est backfillé ci-dessus)
UPDATE public.notifications n
SET sender_id = t.user_id
FROM public.teams t
WHERE n.team_id = t.id
  AND n.sender_id IS NULL
  AND n.type IN ('application_accepted', 'application_declined', 'team_kicked');
