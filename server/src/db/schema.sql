-- Legal Ninja PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  uid                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username                  VARCHAR(30) UNIQUE NOT NULL,
  email                     VARCHAR(255) UNIQUE NOT NULL,
  password_hash             TEXT NOT NULL,
  avatar_url                TEXT DEFAULT '',
  country                   CHAR(2) DEFAULT 'NG',
  track                     VARCHAR(30) DEFAULT 'law_school_track',

  xp                        INTEGER NOT NULL DEFAULT 0,
  level                     SMALLINT NOT NULL DEFAULT 1,
  current_streak            INTEGER NOT NULL DEFAULT 0,
  longest_streak            INTEGER NOT NULL DEFAULT 0,
  total_questions_answered  INTEGER NOT NULL DEFAULT 0,
  total_correct_answers     INTEGER NOT NULL DEFAULT 0,

  free_questions_remaining  INTEGER NOT NULL DEFAULT 100,
  paid_questions_balance    INTEGER NOT NULL DEFAULT 0,
  earned_questions_balance  INTEGER NOT NULL DEFAULT 0,

  badges                    TEXT[] NOT NULL DEFAULT '{}',
  weak_areas                TEXT[] NOT NULL DEFAULT '{}',
  recent_answers            BOOLEAN[] NOT NULL DEFAULT '{}',

  last_demotion_at          TIMESTAMPTZ,
  last_login_at             TIMESTAMPTZ DEFAULT NOW(),
  referral_count            INTEGER NOT NULL DEFAULT 0,
  referral_code             VARCHAR(12) UNIQUE,
  referred_by               UUID REFERENCES users(uid),

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active Passes
CREATE TABLE IF NOT EXISTS active_passes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  pass_type       VARCHAR(30) NOT NULL,
  pass_name       TEXT NOT NULL,
  subject_id      VARCHAR(50),
  expires_at      TIMESTAMPTZ NOT NULL,
  activated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Game Sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  mode              VARCHAR(30) NOT NULL,
  track             VARCHAR(30) NOT NULL,
  subject           VARCHAR(50),
  difficulty        VARCHAR(10) NOT NULL DEFAULT 'medium',
  time_limit_mins   SMALLINT NOT NULL,
  question_count    SMALLINT NOT NULL,

  score             INTEGER NOT NULL DEFAULT 0,
  correct_answers   SMALLINT NOT NULL DEFAULT 0,
  total_answers     SMALLINT NOT NULL DEFAULT 0,
  xp_earned         INTEGER NOT NULL DEFAULT 0,
  grade             CHAR(2),
  percentage        SMALLINT,
  max_streak        SMALLINT NOT NULL DEFAULT 0,

  answers           JSONB NOT NULL DEFAULT '[]',
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  status            VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active','finished','abandoned'))
);

-- Questions cache (so we don't regenerate the same questions)
CREATE TABLE IF NOT EXISTS questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject         VARCHAR(50) NOT NULL,
  track           VARCHAR(30) NOT NULL,
  difficulty      VARCHAR(10) NOT NULL,
  question        TEXT NOT NULL,
  options         JSONB NOT NULL,
  correct_option  CHAR(1) NOT NULL,
  explanation     TEXT,
  topic           TEXT,
  used_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_questions_filter ON questions(subject, difficulty);

-- Leaderboard snapshots
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  leaderboard_type          VARCHAR(30) NOT NULL,
  subject                   VARCHAR(50),
  period_start              DATE NOT NULL,
  rank                      INTEGER,
  total_xp                  INTEGER NOT NULL DEFAULT 0,
  win_rate                  NUMERIC(5,2),
  current_streak            INTEGER NOT NULL DEFAULT 0,
  total_questions_answered  INTEGER NOT NULL DEFAULT 0,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, leaderboard_type, period_start)
);
CREATE INDEX IF NOT EXISTS idx_lb_type_period ON leaderboard_entries(leaderboard_type, period_start, rank);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  reference         VARCHAR(100) UNIQUE NOT NULL,
  gateway           VARCHAR(20) NOT NULL,
  amount_ngn        INTEGER NOT NULL,
  questions_added   INTEGER NOT NULL DEFAULT 0,
  pass_activated    VARCHAR(30),
  bonus_xp          INTEGER NOT NULL DEFAULT 0,
  status            VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  gateway_response  JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

-- Multiplayer Rooms
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(8) UNIQUE NOT NULL,
  host_id         UUID NOT NULL REFERENCES users(uid),
  mode            VARCHAR(20) NOT NULL DEFAULT 'duel',
  track           VARCHAR(30) NOT NULL,
  subject         VARCHAR(50),
  difficulty      VARCHAR(10) NOT NULL DEFAULT 'medium',
  max_players     SMALLINT NOT NULL DEFAULT 2,
  status          VARCHAR(10) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','active','finished')),
  questions       JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS room_players (
  room_id         UUID NOT NULL REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  score           INTEGER NOT NULL DEFAULT 0,
  correct         SMALLINT NOT NULL DEFAULT 0,
  streak          SMALLINT NOT NULL DEFAULT 0,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  quest_id        VARCHAR(50) NOT NULL,
  quest_type      VARCHAR(30) NOT NULL,
  title           TEXT NOT NULL,
  target          INTEGER NOT NULL,
  progress        INTEGER NOT NULL DEFAULT 0,
  status          VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','claimed')),
  reward_xp       INTEGER NOT NULL DEFAULT 0,
  reward_questions INTEGER NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  claimed_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quest_id)
);

-- Daily goals tracker
CREATE TABLE IF NOT EXISTS daily_goals (
  user_id         UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  target          INTEGER NOT NULL DEFAULT 10,
  progress        INTEGER NOT NULL DEFAULT 0,
  completed       BOOLEAN NOT NULL DEFAULT false,
  reward_claimed  BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, date)
);

-- Spaced repetition queue
CREATE TABLE IF NOT EXISTS spaced_repetition (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  next_review_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  interval_days   SMALLINT NOT NULL DEFAULT 1,
  ease_factor     NUMERIC(4,2) NOT NULL DEFAULT 2.5,
  repetitions     SMALLINT NOT NULL DEFAULT 0,
  UNIQUE (user_id, question_id)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
