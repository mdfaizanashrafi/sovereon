--
-- PostgreSQL database dump
--

\restrict RuvKNsNmV59kYjYHaGNM8LhQYCDg980JP7bqdaO3LayU6qhfjkhnBYBllyUERtO

-- Dumped from database version 17.8 (6108b59)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: LibraryType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LibraryType" AS ENUM (
    'book',
    'article',
    'teaching',
    'paper'
);


--
-- Name: PoetryType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PoetryType" AS ENUM (
    'poetry',
    'thesis',
    'reflection'
);


--
-- Name: Priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Priority" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


--
-- Name: Proficiency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Proficiency" AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'expert'
);


--
-- Name: QuestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuestStatus" AS ENUM (
    'active',
    'completed',
    'paused',
    'abandoned'
);


--
-- Name: QuestType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuestType" AS ENUM (
    'personal',
    'professional',
    'learning',
    'adventure'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    user_id text,
    username text,
    action text NOT NULL,
    resource text NOT NULL,
    resource_id text,
    details jsonb,
    ip_address text NOT NULL,
    user_agent text NOT NULL,
    success boolean NOT NULL,
    error_message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiences (
    id text NOT NULL,
    company_name text NOT NULL,
    role_title text NOT NULL,
    description text NOT NULL,
    start_date text NOT NULL,
    end_date text,
    is_current boolean DEFAULT false NOT NULL,
    location text NOT NULL,
    achievements text[],
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: library_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.library_entries (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    author text NOT NULL,
    category public."LibraryType" DEFAULT 'book'::public."LibraryType" NOT NULL,
    cover_image_url text,
    content text NOT NULL,
    key_takeaways text[],
    rating integer DEFAULT 0 NOT NULL,
    read_date text,
    is_recommended boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestones (
    id text NOT NULL,
    quest_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    completed_date text,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: poetry_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.poetry_entries (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type public."PoetryType" DEFAULT 'poetry'::public."PoetryType" NOT NULL,
    tags text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: quests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quests (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    quest_type public."QuestType" DEFAULT 'personal'::public."QuestType" NOT NULL,
    status public."QuestStatus" DEFAULT 'active'::public."QuestStatus" NOT NULL,
    priority public."Priority" DEFAULT 'medium'::public."Priority" NOT NULL,
    start_date text NOT NULL,
    target_date text,
    completed_date text,
    progress_percent integer DEFAULT 0 NOT NULL,
    tags text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: site_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_metadata (
    id text NOT NULL,
    name text NOT NULL,
    logo text NOT NULL,
    birth_date text NOT NULL,
    tagline text NOT NULL,
    description text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    favicon_url text,
    profile_image_url text,
    quote_text text,
    quote_author text
);


--
-- Name: site_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_metrics (
    id text NOT NULL,
    github_commits integer DEFAULT 0 NOT NULL,
    github_repos integer DEFAULT 0 NOT NULL,
    books_read integer DEFAULT 0 NOT NULL,
    projects_completed integer DEFAULT 0 NOT NULL,
    active_quests integer DEFAULT 0 NOT NULL,
    experience_years integer DEFAULT 0 NOT NULL,
    skills_count integer DEFAULT 0 NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: skill_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_categories (
    id text NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text NOT NULL,
    icon_name text DEFAULT 'code'::text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    parent_id text,
    is_expandable boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id text NOT NULL,
    name text NOT NULL,
    category_id text NOT NULL,
    proficiency_level public."Proficiency" DEFAULT 'intermediate'::public."Proficiency" NOT NULL,
    years_experience integer DEFAULT 0 NOT NULL,
    description text NOT NULL,
    is_highlighted boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: social_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_links (
    id text NOT NULL,
    platform text NOT NULL,
    url text NOT NULL,
    label text NOT NULL,
    icon text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    site_metadata_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a8d0d740-7c54-4c34-aeba-24a924fd79e7	34cc574bcaa35c39f5630dd2532fe736213b4016c158603fb13e7b1b9baedf79	2026-03-03 13:50:00.765908+00	20260217184101_first	\N	\N	2026-03-03 13:50:00.429384+00	1
591e6f83-aeea-4ec3-9d29-c13d51ff2d9b	1789aa23bfd368f21b123777d2cbd20e1e6b0577730072e89a0d6f0087d81279	2026-03-03 13:50:00.857287+00	20260218130137_add_site_settings_and_social_links	\N	\N	2026-03-03 13:50:00.772012+00	1
cbee0b9f-bd06-44bc-80b0-40ed361e79a3	a001607eb84df96a797d0faeafdbce45dcb3bc55232dbd34e40af9df4f67e356	2026-03-03 13:50:00.877318+00	20260302173243_add_quote_fields_to_site_metadata	\N	\N	2026-03-03 13:50:00.863813+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, username, action, resource, resource_id, details, ip_address, user_agent, success, error_message, created_at) FROM stdin;
cmmasif8r0000layhml5h6guu	e197f612-8360-473f-b7c2-bb6886376b39	admin	LOGIN	auth	\N	{"path": "/login", "method": "POST"}	10.22.119.66	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	t	\N	2026-03-03 15:56:12.076
cmmat3h3t0000zrk3tvi58ysr	e197f612-8360-473f-b7c2-bb6886376b39	admin	LOGIN	auth	\N	{"path": "/login", "method": "POST"}	10.18.103.146	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	t	\N	2026-03-03 16:12:34.266
cmmatg2az0000b2j5zflkufea	\N	admin	LOGIN	auth	\N	{"path": "/login", "method": "POST"}	10.20.103.131	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	f	Invalid credentials	2026-03-03 16:22:21.612
cmmatge8i0001b2j52dmsn62t	e197f612-8360-473f-b7c2-bb6886376b39	faizanTheKing	LOGIN	auth	\N	{"path": "/login", "method": "POST"}	10.20.103.131	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	t	\N	2026-03-03 16:22:37.075
cmmatk03f0003b2j5u4eofy2z	e197f612-8360-473f-b7c2-bb6886376b39	faizanTheKing	MANAGE	library	\N	{"body": {"title": "The Art of Strategy", "author": "A. Dixit and B. NaleBuff", "rating": 5, "content": "Game Theory", "category": "book", "password": "[REDACTED]", "readDate": "2026-03-01", "newPassword": "[REDACTED]", "keyTakeaways": [], "isRecommended": true, "currentPassword": "[REDACTED]"}, "path": "/", "method": "POST", "duration": "22ms", "statusCode": 201}	10.23.166.131	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	t	\N	2026-03-03 16:25:25.371
cmmatl6pj0005b2j5uak0rsxz	e197f612-8360-473f-b7c2-bb6886376b39	faizanTheKing	MANAGE	quest	\N	{"body": {"tags": [], "title": "Sovereon Inc", "status": "active", "password": "[REDACTED]", "priority": "high", "questType": "professional", "startDate": "2026-02-01", "milestones": [], "targetDate": "2026-12-31", "description": "AI based Social Media Marketing", "newPassword": "[REDACTED]", "currentPassword": "[REDACTED]", "progressPercent": 0}, "path": "/", "method": "POST", "duration": "19ms", "statusCode": 201}	10.23.166.131	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	t	\N	2026-03-03 16:26:20.6
\.


--
-- Data for Name: experiences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.experiences (id, company_name, role_title, description, start_date, end_date, is_current, location, achievements, order_index, created_at, updated_at) FROM stdin;
fce2ebde-bd85-4c5b-a0d9-e3cefc52ba31	Small Scale Tech Company	SEO and BlogPost Manager	Managed SEO strategies and content creation for technology-focused blog posts, driving organic traffic growth and improving search rankings.	2019-01-01	2020-12-31	f	Remote	{"Increased organic traffic by 150% through strategic SEO implementation","Managed content calendar for 50+ technical blog posts","Implemented keyword research and on-page optimization strategies"}	1	2026-03-03 15:38:37.137	2026-03-03 15:38:37.137
6b600b43-85e4-4f21-a451-f7e99a7fba93	Self-Employed	Equity & Crypto Trader	Independent trader specializing in equity and cryptocurrency markets, achieving exceptional returns during volatile market conditions.	2020-01-01	2022-12-31	f	Remote	{"Achieved 200% portfolio return during COVID-19 market volatility","Developed algorithmic trading strategies for crypto markets","Managed risk across diversified asset portfolios"}	2	2026-03-03 15:38:37.137	2026-03-03 15:38:37.137
0d1430f3-ff89-44df-9970-b82fc697739a	affiliateme.in	Founder	Founded and scaled an affiliate marketing and social media marketing education platform, training aspiring digital marketers.	2021-01-01	2022-12-31	f	India	{"Trained 500+ students in affiliate marketing strategies","Built community of 10,000+ digital marketers","Generated ₹50L+ in affiliate revenue for students"}	3	2026-03-03 15:38:37.137	2026-03-03 15:38:37.137
8a6fbc44-4965-4449-9efc-b29ff0187aab	Elite Cyber Security	Sales Executive	Led sales operations for cybersecurity services including vulnerability testing, penetration testing, and security audits.	2023-01-01	2025-01-31	f	India	{"Closed ₹2Cr+ in cybersecurity service contracts","Built relationships with 50+ enterprise clients","Specialized in vulnerability assessment and penetration testing (VAPT) services"}	4	2026-03-03 15:38:37.137	2026-03-03 15:38:37.137
5bcd4f7d-8365-4f94-965c-7c9e6f806dc9	Severeon Inc.	Founder	Building a comprehensive marketing tools ecosystem to empower businesses with cutting-edge digital marketing solutions.	2026-02-01	\N	t	India	{"Building suite of AI-powered marketing automation tools","Developing SaaS platform for enterprise marketing teams","Raising seed funding for expansion"}	5	2026-03-03 15:38:37.137	2026-03-03 15:38:37.137
\.


--
-- Data for Name: library_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.library_entries (id, slug, title, author, category, cover_image_url, content, key_takeaways, rating, read_date, is_recommended, created_at, updated_at) FROM stdin;
cmmas4hw100009a0j3deyblr3	the-richest-man-in-babylon	The Richest Man in Babylon	George S. Clason	book	\N	Timeless financial wisdom through parables.	{"Pay yourself first","Live below your means"}	5	2023-01-15	t	2026-03-03 15:45:22.321	2026-03-03 15:45:22.321
cmmas4hw200019a0jzi5qxq7n	rich-dad-poor-dad	Rich Dad Poor Dad	Robert T. Kiyosaki	book	\N	Lessons on financial education.	{"Make money work for you"}	5	2022-11-20	t	2026-03-03 15:45:22.321	2026-03-03 15:45:22.321
cmmas4hw200029a0jemy697v4	meditations	Meditations	Marcus Aurelius	book	\N	Stoic philosophy.	{"Focus on what you control"}	5	2023-05-10	t	2026-03-03 15:45:22.321	2026-03-03 15:45:22.321
cmmatk0340002b2j5nuu33o0a	the-art-of-strategy-mmatk02t	The Art of Strategy	A. Dixit and B. NaleBuff	book	\N	Game Theory	{}	5	2026-03-01	t	2026-03-03 16:25:25.35	2026-03-03 16:25:25.35
\.


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.milestones (id, quest_id, title, description, is_completed, completed_date, order_index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: poetry_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.poetry_entries (id, slug, title, content, type, tags, created_at, updated_at) FROM stdin;
cmmas4i5700039a0jjzrfjj0m	the-builders-path	The Builder's Path	In lines of code, I find my art.\nEach function plays its vital part.	poetry	{code}	2026-03-03 15:45:22.651	2026-03-03 15:45:22.651
cmmas4i5700049a0jtv1w2ofa	on-entrepreneurship	On Entrepreneurship	To build is to believe in what could be.	reflection	{entrepreneurship}	2026-03-03 15:45:22.651	2026-03-03 15:45:22.651
\.


--
-- Data for Name: quests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quests (id, slug, title, description, quest_type, status, priority, start_date, target_date, completed_date, progress_percent, tags, created_at, updated_at) FROM stdin;
cmmas4idz00059a0jh5669ilk	master-fediverse	Master Fediverse	Understanding decentralized social infrastructure.	adventure	active	high	2026-02-27	2026-12-31	\N	10	{}	2026-03-03 15:45:22.968	2026-03-03 15:45:22.968
cmmas4idz00069a0j9jgmohoo	read-50-books	Read 50 Books	Complete reading 50 books.	personal	active	medium	2024-01-01	2027-12-31	\N	56	{reading}	2026-03-03 15:45:22.968	2026-03-03 15:45:22.968
cmmatl6p10004b2j5ao7vvs1d	sovereon-inc-mmatl6p0	Sovereon Inc	AI based Social Media Marketing	professional	active	high	2026-02-01	2026-12-31	\N	0	{}	2026-03-03 16:26:20.581	2026-03-03 16:26:20.581
\.


--
-- Data for Name: site_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_metadata (id, name, logo, birth_date, tagline, description, updated_at, favicon_url, profile_image_url, quote_text, quote_author) FROM stdin;
c1f6d708-7e5f-4d13-9247-ebfabd20c1ec	Md Faizan Ashrafi	FΔيZΔN	2001-03-13	Engineer • Entrepreneur • Explorer	Building the future through code.	2026-03-03 15:45:23.454	\N	\N	The only way to do great work is to love what you do.	Steve Jobs
\.


--
-- Data for Name: site_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_metrics (id, github_commits, github_repos, books_read, projects_completed, active_quests, experience_years, skills_count, updated_at) FROM stdin;
c1f6d708-7e5f-4d13-9247-ebfabd20c1ec	1247	12	14	8	3	6	20	2026-03-03 15:45:23.289
\.


--
-- Data for Name: skill_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skill_categories (id, name, display_name, description, icon_name, order_index, parent_id, is_expandable, created_at, updated_at) FROM stdin;
cmm4xgzxp0000x979xj9dq5jb	Coding	Coding	Programming languages and frameworks	code	0	\N	t	2026-03-03 15:43:54.561	2026-03-03 15:43:54.561
cmm4xgzxp0001x979sjr7h3ve	Design	Design	Design tools and methodologies	palette	1	\N	t	2026-03-03 15:43:55.03	2026-03-03 15:43:55.03
cmm4xgzxp0002x979vz47lb40	Business	Business	Business skills and management	briefcase	2	\N	t	2026-03-03 15:43:55.174	2026-03-03 15:43:55.174
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skills (id, name, category_id, proficiency_level, years_experience, description, is_highlighted, created_at, updated_at) FROM stdin;
cmmas2msi00016925pyc729hd	TypeScript	cmm4xgzxp0000x979xj9dq5jb	expert	5	Expert TypeScript developer	f	2026-03-03 15:43:55.35	2026-03-03 15:43:55.35
cmmas2myx00036925n0nwgin8	React	cmm4xgzxp0000x979xj9dq5jb	expert	4	Building modern UIs with React	f	2026-03-03 15:43:55.593	2026-03-03 15:43:55.593
cmmas2n4p000569255v1d9h72	Vue.js	cmm4xgzxp0000x979xj9dq5jb	intermediate	2	Frontend development with Vue	f	2026-03-03 15:43:55.802	2026-03-03 15:43:55.802
cmmas2n7s00076925md04mm86	Tailwind CSS	cmm4xgzxp0000x979xj9dq5jb	advanced	3	Styling with Tailwind CSS	f	2026-03-03 15:43:55.913	2026-03-03 15:43:55.913
cmmas2neb00096925xbwu4iu8	Node.js	cmm4xgzxp0000x979xj9dq5jb	expert	5	Backend development with Node.js	f	2026-03-03 15:43:56.147	2026-03-03 15:43:56.147
cmmas2ngs000b6925wntju0l1	Python	cmm4xgzxp0000x979xj9dq5jb	advanced	4	Python for scripting and backend	f	2026-03-03 15:43:56.236	2026-03-03 15:43:56.236
cmmas2nt5000d6925xhq2zm60	PostgreSQL	cmm4xgzxp0000x979xj9dq5jb	advanced	3	Database design with PostgreSQL	f	2026-03-03 15:43:56.681	2026-03-03 15:43:56.681
cmmas2nw1000f69255pqtgyer	Docker	cmm4xgzxp0000x979xj9dq5jb	advanced	2	Containerization with Docker	f	2026-03-03 15:43:56.786	2026-03-03 15:43:56.786
cmmas2nz8000h69253ry7ftqa	AWS	cmm4xgzxp0000x979xj9dq5jb	intermediate	2	Cloud infrastructure on AWS	f	2026-03-03 15:43:56.9	2026-03-03 15:43:56.9
cmmas2o4y000j69258kgghp6p	JavaScript	cmm4xgzxp0000x979xj9dq5jb	expert	6	Core JavaScript development	f	2026-03-03 15:43:57.106	2026-03-03 15:43:57.106
cmmas2o7x000l6925b143prvk	Next.js	cmm4xgzxp0000x979xj9dq5jb	advanced	3	Full-stack with Next.js	f	2026-03-03 15:43:57.214	2026-03-03 15:43:57.214
cmmas2oan000n6925kz7h5gti	Go (Golang)	cmm4xgzxp0000x979xj9dq5jb	intermediate	1	Systems programming with Go	f	2026-03-03 15:43:57.311	2026-03-03 15:43:57.311
cmmas2ocy000p6925r63cgh79	Redis	cmm4xgzxp0000x979xj9dq5jb	intermediate	1	Caching with Redis	f	2026-03-03 15:43:57.394	2026-03-03 15:43:57.394
cmmas2ofd000r69256l56seom	MongoDB	cmm4xgzxp0000x979xj9dq5jb	intermediate	1	NoSQL with MongoDB	f	2026-03-03 15:43:57.482	2026-03-03 15:43:57.482
cmmas2oi2000t69258zj195bp	Kubernetes	cmm4xgzxp0000x979xj9dq5jb	beginner	0	Container orchestration	f	2026-03-03 15:43:57.579	2026-03-03 15:43:57.579
cmmas2ol1000v6925dgngqwjf	CI/CD Pipelines	cmm4xgzxp0000x979xj9dq5jb	intermediate	1	DevOps automation	f	2026-03-03 15:43:57.686	2026-03-03 15:43:57.686
cmmas2oru000x6925421mgiwy	Figma	cmm4xgzxp0001x979sjr7h3ve	advanced	3	UI/UX design in Figma	f	2026-03-03 15:43:57.93	2026-03-03 15:43:57.93
cmmas2oy9000z6925v8728kdc	UI/UX Design	cmm4xgzxp0001x979sjr7h3ve	advanced	4	User experience design	f	2026-03-03 15:43:58.161	2026-03-03 15:43:58.161
cmmas2p3s00116925snwnonzo	Product Management	cmm4xgzxp0002x979vz47lb40	intermediate	2	Product strategy and management	f	2026-03-03 15:43:58.36	2026-03-03 15:43:58.36
cmmas2pam0013692585dm5vyl	Marketing	cmm4xgzxp0002x979vz47lb40	intermediate	2	Digital marketing expertise	f	2026-03-03 15:43:58.606	2026-03-03 15:43:58.606
\.


--
-- Data for Name: social_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.social_links (id, platform, url, label, icon, order_index, is_active, site_metadata_id, created_at, updated_at) FROM stdin;
cmmas4ivu00079a0janx414ns	github	https://github.com/mdfaizanashrafi	GitHub	github	0	t	c1f6d708-7e5f-4d13-9247-ebfabd20c1ec	2026-03-03 15:45:23.611	2026-03-03 15:45:23.611
cmmas4ivv00089a0jjk6nvgzd	twitter	https://x.com/_mohamedfaizan_	Twitter	twitter	1	t	c1f6d708-7e5f-4d13-9247-ebfabd20c1ec	2026-03-03 15:45:23.611	2026-03-03 15:45:23.611
cmmas4ivv00099a0jc87mqmiz	email	mailto:mdfaizanashrafi13032001@gmail.com	Email	mail	2	t	c1f6d708-7e5f-4d13-9247-ebfabd20c1ec	2026-03-03 15:45:23.611	2026-03-03 15:45:23.611
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, role, created_at, updated_at) FROM stdin;
e197f612-8360-473f-b7c2-bb6886376b39	faizanTheKing	$2b$12$BoPiAIUiexflOmc8v0AuPOS0CpO0.2xI7hDaoegVjlvuVmXEQP0EO	admin	2026-03-03 15:38:36.806	2026-03-03 16:15:31.803
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: experiences experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_pkey PRIMARY KEY (id);


--
-- Name: library_entries library_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.library_entries
    ADD CONSTRAINT library_entries_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: poetry_entries poetry_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.poetry_entries
    ADD CONSTRAINT poetry_entries_pkey PRIMARY KEY (id);


--
-- Name: quests quests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT quests_pkey PRIMARY KEY (id);


--
-- Name: site_metadata site_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_metadata
    ADD CONSTRAINT site_metadata_pkey PRIMARY KEY (id);


--
-- Name: site_metrics site_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_metrics
    ADD CONSTRAINT site_metrics_pkey PRIMARY KEY (id);


--
-- Name: skill_categories skill_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_categories
    ADD CONSTRAINT skill_categories_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: social_links social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_links
    ADD CONSTRAINT social_links_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: library_entries_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX library_entries_slug_key ON public.library_entries USING btree (slug);


--
-- Name: poetry_entries_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX poetry_entries_slug_key ON public.poetry_entries USING btree (slug);


--
-- Name: quests_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX quests_slug_key ON public.quests USING btree (slug);


--
-- Name: skill_categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX skill_categories_name_key ON public.skill_categories USING btree (name);


--
-- Name: skills_name_category_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX skills_name_category_id_key ON public.skills USING btree (name, category_id);


--
-- Name: social_links_platform_site_metadata_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX social_links_platform_site_metadata_id_key ON public.social_links USING btree (platform, site_metadata_id);


--
-- Name: social_links_site_metadata_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX social_links_site_metadata_id_idx ON public.social_links USING btree (site_metadata_id);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: milestones milestones_quest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill_categories skill_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_categories
    ADD CONSTRAINT skill_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.skill_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: skills skills_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.skill_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: social_links social_links_site_metadata_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_links
    ADD CONSTRAINT social_links_site_metadata_id_fkey FOREIGN KEY (site_metadata_id) REFERENCES public.site_metadata(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict RuvKNsNmV59kYjYHaGNM8LhQYCDg980JP7bqdaO3LayU6qhfjkhnBYBllyUERtO

