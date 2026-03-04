-- Translate existing French notification messages to English
-- Run this after the app has been updated to send English messages

UPDATE public.notifications
SET message = regexp_replace(
  message,
  '^(.+?) a postulé à ton équipe "(.+?)"\.$',
  '\1 applied to your team "\2".'
)
WHERE type = 'application_received'
  AND message ~ '^.+ a postulé à ton équipe ".+"\.$';

UPDATE public.notifications
SET message = regexp_replace(
  message,
  '^Tu as été invité\(e\) à rejoindre l''équipe "(.+?)"\.$',
  'You were invited to join the team "\1".'
)
WHERE type = 'team_invitation'
  AND message ~ '^Tu as été invité\(e\) à rejoindre l''équipe ".+"\.$';

UPDATE public.notifications
SET message = 'Your application was declined. New teams are waiting for you in the dashboard.'
WHERE type = 'application_declined'
  AND message = 'Ta candidature a été refusée. De nouvelles équipes t''attendent dans le tableau de bord.';

UPDATE public.notifications
SET message = regexp_replace(
  message,
  '^Tu as été accepté\(e\) dans l''équipe "(.+?)"\.$',
  'You were accepted into the team "\1".'
)
WHERE type = 'application_accepted'
  AND message ~ '^Tu as été accepté\(e\) dans l''équipe ".+"\.$';

UPDATE public.notifications
SET message = regexp_replace(
  message,
  '^Nouveau message dans le chat de l''équipe "(.+?)"\.$',
  'New message in the team chat "\1".'
)
WHERE type = 'team_chat'
  AND message ~ '^Nouveau message dans le chat de l''équipe ".+"\.$';
