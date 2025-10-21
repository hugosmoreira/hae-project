-- Insert sample polls
DO $$
DECLARE
  user_id_var UUID;
  poll_id_1 UUID;
  poll_id_2 UUID;
  poll_id_3 UUID;
BEGIN
  -- Get a user ID
  SELECT id INTO user_id_var FROM public.profiles WHERE username = 'hugosmoreira' LIMIT 1;
  
  -- Insert first poll
  INSERT INTO public.polls (question, description, author_id, expires_at, total_votes)
  VALUES (
    'How often do you conduct HQS inspections?',
    'Help us understand inspection frequency across different housing authorities.',
    user_id_var,
    now() + interval '2 days',
    42
  ) RETURNING id INTO poll_id_1;
  
  -- Insert options for first poll
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
    (poll_id_1, 'Monthly', 12),
    (poll_id_1, 'Quarterly', 18),
    (poll_id_1, 'Bi-annually', 8),
    (poll_id_1, 'Annually', 4);
  
  -- Insert second poll
  INSERT INTO public.polls (question, description, author_id, expires_at, total_votes)
  VALUES (
    'What property management software does your HA use?',
    'Share what system you use to manage your housing authority operations.',
    user_id_var,
    now() + interval '5 days',
    67
  ) RETURNING id INTO poll_id_2;
  
  -- Insert options for second poll
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
    (poll_id_2, 'Yardi Voyager', 28),
    (poll_id_2, 'Elite (MRI)', 15),
    (poll_id_2, 'OneSite (RealPage)', 12),
    (poll_id_2, 'Other/Custom', 8),
    (poll_id_2, 'Tenmast', 4);
  
  -- Insert third poll
  INSERT INTO public.polls (question, description, author_id, expires_at, total_votes)
  VALUES (
    'How do you handle after-hours maintenance emergencies?',
    'Compare emergency response procedures across housing authorities.',
    user_id_var,
    now() + interval '7 days',
    38
  ) RETURNING id INTO poll_id_3;
  
  -- Insert options for third poll
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
    (poll_id_3, 'In-house on-call staff', 16),
    (poll_id_3, 'Third-party contractor', 11),
    (poll_id_3, 'Resident portal reporting', 7),
    (poll_id_3, 'Automated answering service', 4);
END $$;