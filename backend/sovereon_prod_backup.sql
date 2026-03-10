--
-- PostgreSQL database dump
--

\restrict Kd6lIslaIfejDMcdkirq37b4PsqyowYS9EhWFn1hIarQcBOmfuLpy7mdyld8Qub

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


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
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "resourceType" text NOT NULL,
    "resourceId" text,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    image text,
    category text NOT NULL,
    tags text NOT NULL,
    author text NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "isPublished" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: case_studies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_studies (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    client text NOT NULL,
    industry text NOT NULL,
    description text NOT NULL,
    challenge text NOT NULL,
    solution text NOT NULL,
    results text NOT NULL,
    image text,
    technologies text NOT NULL,
    metrics text NOT NULL,
    testimonial text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    service text,
    message text NOT NULL,
    "formType" text DEFAULT 'contact'::text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "isSpam" boolean DEFAULT false NOT NULL,
    "adminNotified" boolean DEFAULT false NOT NULL,
    "autoReplied" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: current_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.current_projects (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    image text,
    technologies text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: future_quests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.future_quests (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    timeline text NOT NULL,
    icon text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: global_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    amount double precision NOT NULL,
    tax double precision DEFAULT 0 NOT NULL,
    total double precision NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "issuedDate" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    "paidDate" timestamp(3) without time zone,
    "paymentMethod" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data text,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text NOT NULL,
    "serviceId" text,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" double precision NOT NULL,
    "totalAmount" double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "paymentStatus" text DEFAULT 'unpaid'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: page_contents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_contents (
    id text NOT NULL,
    page text NOT NULL,
    section text NOT NULL,
    content text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "invoiceId" text,
    "orderId" text,
    "userId" text NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "paymentMethod" text DEFAULT 'credit_card'::text NOT NULL,
    "stripePaymentId" text,
    status text DEFAULT 'pending'::text NOT NULL,
    metadata text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    category text NOT NULL,
    "pricingModel" text DEFAULT 'fixed'::text NOT NULL,
    "basePrice" double precision NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    features text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: services_cms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services_cms (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    "categoryId" text NOT NULL,
    "shortDescription" text NOT NULL,
    "fullDescription" text NOT NULL,
    features text NOT NULL,
    benefits text NOT NULL,
    strategy text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "serviceId" text NOT NULL,
    "planName" text NOT NULL,
    price double precision NOT NULL,
    "billingCycle" text DEFAULT 'monthly'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "currentPeriodStart" timestamp(3) without time zone,
    "currentPeriodEnd" timestamp(3) without time zone,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cancelledAt" timestamp(3) without time zone
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    department text NOT NULL,
    description text NOT NULL,
    image text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id text NOT NULL,
    name text NOT NULL,
    company text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    avatar text,
    "beforeMetric" text,
    "afterMetric" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text,
    "lastName" text,
    "companyName" text,
    phone text,
    name text,
    avatar text,
    provider text DEFAULT 'email'::text,
    role text DEFAULT 'user'::text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
57099d40-45c5-4f70-9037-ae0f1f41b16b	aafb7eb625b2b0efb66585f1ac4c3bb9fbb4dbefac4ace8b93a7f7d1c1939b3b	\N	20260223220824_init	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260223220824_init\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "blog_posts" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"blog_posts\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(636), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260223220824_init"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260223220824_init"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2026-02-23 22:46:23.835023+00	2026-02-23 22:33:04.968559+00	0
865cb212-bc30-4fbb-b398-3ab29258c92b	c9847c91396a9bb14f0bf1a12eb7d8c237546021ed7c2f6b42a35d43db77ba41	\N	20260223223433_init	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260223223433_init\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "users" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"users\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1177), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260223223433_init"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260223223433_init"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2026-02-23 22:51:25.200988+00	2026-02-23 22:49:34.925936+00	0
63abacf3-9944-4c11-aa9b-bcc2d095c2c8	c9847c91396a9bb14f0bf1a12eb7d8c237546021ed7c2f6b42a35d43db77ba41	2026-02-23 22:51:25.203073+00	20260223223433_init		\N	2026-02-23 22:51:25.203073+00	0
61ca4c19-ba07-4f15-8080-9c33dacd3bbc	7ed4fd649b91c56b3f1f9ca1522bcdd73f4284c3debabbb66b46b878c1284316	2026-02-24 10:28:38.510396+00	20250224150000_initial_schema	\N	\N	2026-02-24 10:28:38.294878+00	1
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, username, password, "lastLogin", "createdAt", "updatedAt") FROM stdin;
cmm0f7dak0000474adrs5jq2e	admin	$2a$12$.yekC4F9svYj1bf.p4A8y.eF5pOGSuYj2j.AIauYz0C1M2TRjLiv6	2026-03-09 19:31:58.138	2026-02-24 09:45:59.564	2026-03-09 19:31:58.14
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", action, "resourceType", "resourceId", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_posts (id, title, slug, excerpt, content, image, category, tags, author, "publishedAt", "isPublished", "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: case_studies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.case_studies (id, title, slug, client, industry, description, challenge, solution, results, image, technologies, metrics, testimonial, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contact_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_submissions (id, name, email, phone, company, service, message, "formType", "ipAddress", "userAgent", "isSpam", "adminNotified", "autoReplied", "createdAt", "updatedAt") FROM stdin;
cmm10bk6i00006da1qo01ktsw	faiazan	faizan@faizan.com	7378242874	vcv	Software & App Development	vsdv	contact	223.181.29.167	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	f	t	t	2026-02-24 19:37:07.05	2026-02-24 19:37:07.441
cmm111yz90000bi0zvhkcey12	dagdg	afgd@af.com	235523565	\N	Software & App Development	afdagsdfg	consultation	223.181.29.167	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	f	t	t	2026-02-24 19:57:39.285	2026-02-24 19:57:39.771
cmm116bgg0001bi0zwqjq7mg5	afdhh	jabsfb@jbdf.com	235262646	\N	Software & App Development	dagsdgg	consultation	223.228.245.214	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	f	t	t	2026-02-24 20:01:02.079	2026-02-24 20:01:02.508
cmm24snyu0000l4kbmt8yt7db	Fahg	redo.ridges_8t@icloud.com	457458544	Fadgh	Software & App Development	Gaag	contact	172.225.220.190	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	f	t	t	2026-02-25 14:30:09.75	2026-02-25 14:30:10.337
cmm35eg1x0001l4kbmfe5swlr	Ali Ahmad	akiimaniyar1717@gmail.com	7970767687	\N	Communication & Messaging Services	How to build a strong bond in relationship	contact	117.96.150.11	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23D127 Instagram 416.1.0.27.68 (iPhone14,5; iOS 26_3; en_US; en; scale=3.00; 1170x2532; IABMV/1; 881475720) Safari/604.1	f	t	t	2026-02-26 07:34:52.069	2026-02-26 07:34:52.658
cmm4l052o0002l4kbei1ab7ex	Aqsha Fatma	aqshafarma11@gmai.com	9176348540	\N	Communication & Messaging Services	Fresher	consultation	223.185.63.174	Mozilla/5.0 (Linux; Android 15; CPH2531 Build/AP3A.240617.008; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/145.0.7632.103 Mobile Safari/537.36 Instagram 417.0.0.54.77 Android (35/15; 480dpi; 1080x2412; OPPO; CPH2531; OP5705L1; mt6877; en_GB; 884780529; IABMV/1)	f	t	t	2026-02-27 07:39:24.707	2026-02-27 07:39:25.283
\.


--
-- Data for Name: current_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.current_projects (id, title, description, progress, image, technologies, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faqs (id, question, answer, category, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
cmm0jgaae002cm3wiwqobelk9	What services does Sovereon Inc. offer?	We offer a comprehensive range of digital services including AI solutions, web and mobile app development, digital marketing, SEO, cloud solutions, bulk SMS/IVR services, and content production. Our services are powered by cutting-edge AI technology to deliver better results faster.	General	1	t	2026-02-24 11:44:54.039	2026-02-24 11:44:54.039
cmm0jgaah002dm3wiz27k7oji	How long does it take to build a website?	The timeline depends on the complexity of your project. A simple brochure website typically takes 2-3 weeks, while complex e-commerce or custom web applications may take 6-12 weeks. We provide detailed timelines during our initial consultation.	Services	2	t	2026-02-24 11:44:54.042	2026-02-24 11:44:54.042
cmm0jgaaj002em3wix1cbc9nw	Do you offer ongoing maintenance and support?	Yes! We offer various maintenance packages to keep your website or application running smoothly. This includes regular updates, security patches, performance optimization, and technical support. Our team is available 24/7 for critical issues.	Services	3	t	2026-02-24 11:44:54.044	2026-02-24 11:44:54.044
cmm0jgaal002fm3wi9yr48mku	What makes Sovereon different from other agencies?	We combine traditional digital services with AI-powered solutions to deliver faster, more effective results. Our team brings fresh innovation from February 2026, and we are committed to measurable ROI for every client. Plus, we are based in Bhagalpur, Bihar, bringing world-class solutions to Eastern India.	General	4	t	2026-02-24 11:44:54.045	2026-02-24 11:44:54.045
cmm0jgaan002gm3wi6hs88fw3	How much do your services cost?	Our pricing varies based on project scope and requirements. We offer competitive rates and provide detailed quotes after understanding your needs. Check our pricing page for starting prices, or contact us for a custom quote.	Pricing	5	t	2026-02-24 11:44:54.047	2026-02-24 11:44:54.047
cmm0jgaap002hm3wil8etrgqa	Do you work with clients outside Bhagalpur?	Absolutely! While we are proud to be based in Bhagalpur, we serve clients across India and internationally. Our digital workflow allows us to collaborate effectively with clients regardless of location.	General	6	t	2026-02-24 11:44:54.049	2026-02-24 11:44:54.049
cmm0jgaar002im3wirj3e1du9	What is your AI-powered SEO service?	Our AI-powered SEO uses machine learning algorithms to analyze search patterns, identify high-value keywords, and optimize your content more effectively than traditional methods. Clients typically see 3x faster ranking improvements compared to conventional SEO.	Services	7	t	2026-02-24 11:44:54.051	2026-02-24 11:44:54.051
cmm0jgaat002jm3wij62f959p	How do I get started?	Simply fill out our contact form or give us a call at 9113156083. We will schedule a free consultation to understand your needs and recommend the best solutions for your business.	General	8	t	2026-02-24 11:44:54.053	2026-02-24 11:44:54.053
\.


--
-- Data for Name: future_quests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.future_quests (id, title, description, timeline, icon, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: global_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.global_settings (id, key, value, "updatedAt") FROM stdin;
cmm0f7das0001474awf4i5dxr	companyName	Sovereon Inc.	2026-02-24 09:45:59.573
cmm0f7daz0002474aih4slcbo	companyTagline	AI-Powered Digital Solutions	2026-02-24 09:45:59.58
cmm0f7dbo0003474aae5vkgej	contactPhone	9113156083	2026-02-24 09:45:59.605
cmm0f7dcz0004474ao6zwvpm5	contactEmail	sovereon@sovereon.online	2026-02-24 09:45:59.651
cmm0f7dd30005474asjauzv08	addressCity	Bhagalpur	2026-02-24 09:45:59.655
cmm0f7dd70006474a44dknuk9	addressState	Bihar	2026-02-24 09:45:59.659
cmm0f7ddc0007474auko8gcbo	addressPincode	812002	2026-02-24 09:45:59.665
cmm0f7ddh0008474a1h7y2jv2	addressCountry	India	2026-02-24 09:45:59.67
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, "invoiceNumber", "userId", "orderId", amount, tax, total, status, "issuedDate", "dueDate", "paidDate", "paymentMethod", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", type, title, message, data, "isRead", "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, "orderNumber", "userId", "serviceId", quantity, "unitPrice", "totalAmount", status, "paymentStatus", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: page_contents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.page_contents (id, page, section, content, "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, "invoiceId", "orderId", "userId", amount, currency, "paymentMethod", "stripePaymentId", status, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_categories (id, slug, title, description, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
cmm0jga36000lm3wieq3if3lq	ai-services	AI Services	Cutting-edge AI solutions to transform your business with intelligent automation and insights.	1	t	2026-02-24 11:44:53.778	2026-02-24 11:44:53.778
cmm0jga38000mm3wib4sfethf	communication-messaging	Communication & Messaging Services	Reach your audience instantly with AI-powered messaging solutions.	2	t	2026-02-24 11:44:53.781	2026-02-24 11:44:53.781
cmm0jga4i000nm3wievd9uns9	software-app-development	Software & App Development	Custom software solutions built with cutting-edge AI technology.	3	t	2026-02-24 11:44:53.826	2026-02-24 11:44:53.826
cmm0jga4k000om3wijdhb5lzf	maintenance-support	Maintenance & Support	Keep your digital assets running smoothly 24/7.	4	t	2026-02-24 11:44:53.829	2026-02-24 11:44:53.829
cmm0jga4n000pm3wi4qw7857b	cloud-it-solutions	Cloud & IT Solutions	Scalable cloud infrastructure and digital transformation.	5	t	2026-02-24 11:44:53.831	2026-02-24 11:44:53.831
cmm0jga4p000qm3wiayyys2hr	digital-marketing-seo	Digital Marketing & SEO	AI-powered marketing strategies for maximum ROI.	6	t	2026-02-24 11:44:53.833	2026-02-24 11:44:53.833
cmm0jga4r000rm3wipr1vpzeb	content-media-production	Content & Media Production	Professional content creation with AI enhancement.	7	t	2026-02-24 11:44:53.836	2026-02-24 11:44:53.836
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, name, slug, description, category, "pricingModel", "basePrice", "isActive", features, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: services_cms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services_cms (id, slug, title, "categoryId", "shortDescription", "fullDescription", features, benefits, strategy, "isActive", "order", "createdAt", "updatedAt") FROM stdin;
cmm0jga54000tm3wiy9o97pnu	ai-seo-search	AI SEO for AI Search	cmm0jga36000lm3wieq3if3lq	Optimize your content for AI-powered search engines like ChatGPT, Perplexity, and Google SGE.	Stay ahead of the search evolution with our AI SEO services.	["AI search engine optimization","Conversational AI visibility"]	["Appear in ChatGPT responses","Higher visibility"]	[{"step":1,"title":"Audit","description":"Analyze AI perception"}]	t	1	2026-02-24 11:44:53.838	2026-02-24 11:44:53.838
cmm0jga58000vm3wi2z9oebtw	personalized-ai-agents	Personalized AI Agents	cmm0jga36000lm3wieq3if3lq	Custom AI assistants tailored to your business needs.	Deploy intelligent AI agents for customer service and operations.	["Custom-trained models","Multi-platform"]	["24/7 support","Reduced costs"]	[{"step":1,"title":"Analysis","description":"Define use cases"}]	t	2	2026-02-24 11:44:53.853	2026-02-24 11:44:53.853
cmm0jga5b000xm3wi75m2z0k7	ai-content-generation	AI Content Generation	cmm0jga36000lm3wieq3if3lq	Scale content production with AI-powered creation.	Supercharge your content strategy with AI-generated materials.	["Blog writing","Social automation"]	["10x content output"]	[{"step":1,"title":"Training","description":"Train AI on brand"}]	t	3	2026-02-24 11:44:53.855	2026-02-24 11:44:53.855
cmm0jga5d000zm3wi1w3e6q8o	ai-data-analytics	AI Data Analytics	cmm0jga36000lm3wieq3if3lq	Unlock hidden patterns with AI analytics.	Transform raw data into actionable intelligence.	["Predictive analytics","Behavior analysis"]	["Data-driven decisions"]	[{"step":1,"title":"Assessment","description":"Evaluate data"}]	t	4	2026-02-24 11:44:53.858	2026-02-24 11:44:53.858
cmm0jga5f0011m3wirmypppe5	broadcast-sms	Broadcast SMS	cmm0jga38000mm3wib4sfethf	Mass messaging for instant customer reach.	Send personalized bulk messages with AI targeting.	["AI segmentation","Real-time tracking"]	["98% open rate"]	[{"step":1,"title":"Analysis","description":"AI targeting"}]	t	5	2026-02-24 11:44:53.86	2026-02-24 11:44:53.86
cmm0jga5i0013m3wif7xwul5y	bulk-sms	Bulk SMS	cmm0jga38000mm3wib4sfethf	High-volume SMS for business communication.	Enterprise-grade bulk SMS service.	["API integration","Multi-language"]	["99.9% uptime"]	[{"step":1,"title":"Setup","description":"API integration"}]	t	6	2026-02-24 11:44:53.862	2026-02-24 11:44:53.862
cmm0jga5k0015m3wifpldjk9j	ivr-calling	IVR Calling	cmm0jga38000mm3wib4sfethf	Automated voice calls for promotions.	Interactive Voice Response system.	["AI voice synthesis","Multi-language"]	["Human-like quality"]	[{"step":1,"title":"Script","description":"Design scripts"}]	t	7	2026-02-24 11:44:53.865	2026-02-24 11:44:53.865
cmm0jga5n0017m3wigr7tzt54	email-sms-marketing	Email & SMS Marketing	cmm0jga38000mm3wib4sfethf	Unified multi-channel marketing.	Combine email and SMS for powerful campaigns.	["Cross-channel automation","A/B testing"]	["3x higher engagement"]	[{"step":1,"title":"Strategy","description":"Channel mix"}]	t	8	2026-02-24 11:44:53.867	2026-02-24 11:44:53.867
cmm0jga790019m3wiujb0rvyn	website-design-development	Website Design & Development	cmm0jga4i000nm3wievd9uns9	Stunning websites with AI optimization.	Responsive, SEO-friendly websites.	["AI UX optimization","Responsive design"]	["Higher rankings"]	[{"step":1,"title":"Discovery","description":"Understand goals"}]	t	9	2026-02-24 11:44:53.926	2026-02-24 11:44:53.926
cmm0jga7c001bm3wiosamyacl	mobile-app-development	Mobile App Development	cmm0jga4i000nm3wievd9uns9	Native and cross-platform mobile apps.	iOS and Android apps with AI features.	["AI integration","Push notifications"]	["Wider reach"]	[{"step":1,"title":"Analysis","description":"Define features"}]	t	10	2026-02-24 11:44:53.929	2026-02-24 11:44:53.929
cmm0jga7f001dm3wix81h0sq6	custom-software-solutions	Custom Software Solutions	cmm0jga4i000nm3wievd9uns9	Tailored software for unique needs.	Bespoke applications for your workflows.	["Process automation","AI analytics"]	["Streamlined operations"]	[{"step":1,"title":"Process Analysis","description":"Map workflows"}]	t	11	2026-02-24 11:44:53.931	2026-02-24 11:44:53.931
cmm0jga7h001fm3wi3i0vfchb	ui-ux-design	UI/UX Design	cmm0jga4i000nm3wievd9uns9	User-centered design with AI insights.	Intuitive interfaces with AI analysis.	["User research","AI heatmaps"]	["Higher satisfaction"]	[{"step":1,"title":"Research","description":"Understand users"}]	t	12	2026-02-24 11:44:53.933	2026-02-24 11:44:53.933
cmm0jga7j001hm3wivhqh1wrc	web-app-maintenance	Web & App Maintenance	cmm0jga4k000om3wijdhb5lzf	24/7 monitoring and maintenance.	Comprehensive maintenance with AI monitoring.	["AI monitoring","Security patches"]	["99.9% uptime"]	[{"step":1,"title":"Audit","description":"System health"}]	t	13	2026-02-24 11:44:53.935	2026-02-24 11:44:53.935
cmm0jga7l001jm3wizxjyxcit	cloud-solutions-hosting	Cloud Solutions & Hosting	cmm0jga4n000pm3wi4qw7857b	Scalable cloud infrastructure.	Reliable cloud hosting with auto-scaling.	["Auto-scaling","Global CDN"]	["Handle traffic spikes"]	[{"step":1,"title":"Assessment","description":"Evaluate needs"}]	t	14	2026-02-24 11:44:53.937	2026-02-24 11:44:53.937
cmm0jga7n001lm3wi9h66hrrl	it-consulting-transformation	IT Consulting	cmm0jga4n000pm3wi4qw7857b	Strategic IT guidance.	Expert consulting for digital transformation.	["IT strategy","Transformation roadmap"]	["Competitive advantage"]	[{"step":1,"title":"Current State","description":"Analyze IT"}]	t	15	2026-02-24 11:44:53.939	2026-02-24 11:44:53.939
cmm0jga7p001nm3wixcg918ma	seo	Search Engine Optimization	cmm0jga4p000qm3wiayyys2hr	Rank higher with AI SEO.	AI-driven SEO for top rankings.	["AI keyword research","Technical SEO"]	["Higher rankings"]	[{"step":1,"title":"Audit","description":"Analyze performance"}]	t	16	2026-02-24 11:44:53.941	2026-02-24 11:44:53.941
cmm0jga7r001pm3wistfjnfv8	social-media-marketing	Social Media Marketing	cmm0jga4p000qm3wiayyys2hr	Engage audiences on social platforms.	AI-powered social media management.	["AI scheduling","Multi-platform"]	["Increased awareness"]	[{"step":1,"title":"Platform Analysis","description":"Identify platforms"}]	t	17	2026-02-24 11:44:53.943	2026-02-24 11:44:53.943
cmm0jga7t001rm3wizxgpdio2	paid-ads	Paid Ads	cmm0jga4p000qm3wiayyys2hr	Targeted advertising with AI optimization.	Data-driven campaigns across platforms.	["AI bid optimization","Targeting"]	["Lower cost per click"]	[{"step":1,"title":"Research","description":"Define demographics"}]	t	18	2026-02-24 11:44:53.945	2026-02-24 11:44:53.945
cmm0jga7v001tm3wiiqp0cyar	influencer-marketing	Influencer Marketing	cmm0jga4p000qm3wiayyys2hr	Partner with relevant influencers.	Connect with aligned influencers.	["AI matching","Campaign management"]	["Authentic advocacy"]	[{"step":1,"title":"Search","description":"Find matches"}]	t	19	2026-02-24 11:44:53.947	2026-02-24 11:44:53.947
cmm0jga7x001vm3wi4o0zapef	lead-generation	Lead Generation	cmm0jga4p000qm3wiayyys2hr	AI-powered lead generation.	Build automated conversion funnels.	["Landing pages","Lead scoring"]	["More qualified leads"]	[{"step":1,"title":"Design","description":"Map journey"}]	t	20	2026-02-24 11:44:53.949	2026-02-24 11:44:53.949
cmm0jga7z001xm3wibtpybtlj	podcast-production-only	Podcast Production	cmm0jga4r000rm3wipr1vpzeb	Professional podcast recording.	End-to-end podcast production.	["Studio recording","Professional editing"]	["Professional quality"]	[{"step":1,"title":"Planning","description":"Define structure"}]	t	21	2026-02-24 11:44:53.951	2026-02-24 11:44:53.951
cmm0jga81001zm3wi57ujrb32	podcast-production-promotion	Podcast Production & Promotion	cmm0jga4r000rm3wipr1vpzeb	Full podcast service with marketing.	Complete podcast solution.	["Production","Distribution"]	["Wider reach"]	[{"step":1,"title":"Strategy","description":"Marketing plan"}]	t	22	2026-02-24 11:44:53.953	2026-02-24 11:44:53.953
cmm0jga830021m3wi3iw9lrlq	online-pr-reputation	Online PR & Reputation	cmm0jga4r000rm3wipr1vpzeb	Build and protect brand reputation.	Monitor and improve online presence.	["Brand monitoring","Review management"]	["Positive image"]	[{"step":1,"title":"Audit","description":"Assess reputation"}]	t	23	2026-02-24 11:44:53.955	2026-02-24 11:44:53.955
cmm0jga850023m3wicm2lz97d	ad-shoot	Ad Shoot	cmm0jga4r000rm3wipr1vpzeb	Professional video production.	High-quality video for commercials.	["4K production","Scriptwriting"]	["Cinematic quality"]	[{"step":1,"title":"Concept","description":"Creative concept"}]	t	24	2026-02-24 11:44:53.957	2026-02-24 11:44:53.957
cmm0jga870025m3wiaplyo5jg	photo-shoot	Photo Shoot	cmm0jga4r000rm3wipr1vpzeb	Professional photography.	Product, corporate, lifestyle photography.	["Product photography","Headshots"]	["Professional imagery"]	[{"step":1,"title":"Briefing","description":"Understand needs"}]	t	25	2026-02-24 11:44:53.96	2026-02-24 11:44:53.96
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
sLd8CIiwizyMdYWtBvBH4tA8WExGH619	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-10T19:31:58.154Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"adminId":"cmm0f7dak0000474adrs5jq2e"}	2026-03-10 19:32:01
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, "userId", "serviceId", "planName", price, "billingCycle", status, "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd", "createdAt", "updatedAt", "cancelledAt") FROM stdin;
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, name, role, department, description, image, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
cmm0jga260009m3wine1y6izl	Md Faizan Ashrafi	Technical Lead	Technicalities	Oversees all technical operations, software development, and AI integration strategies.	\N	1	t	2026-02-24 11:44:53.743	2026-02-24 11:44:53.743
cmm0jga2a000am3wiy7qdg708	Md Altamash Khan	CRM Manager	Customer Relations	Manages client relationships, ensures customer satisfaction, and leads support initiatives.	\N	2	t	2026-02-24 11:44:53.747	2026-02-24 11:44:53.747
cmm0jga2e000bm3witw8a7mwb	Jawed Akhtar	Project Manager	Project Management	Leads project planning, execution, and delivery to ensure timely and successful project completion.	\N	3	t	2026-02-24 11:44:53.751	2026-02-24 11:44:53.751
cmm0jga2h000cm3wic3fl9nh7	Karan Raj	Video Graphic Manager	Creative Services	Manages video production and graphic design to create stunning visual content.	\N	4	t	2026-02-24 11:44:53.753	2026-02-24 11:44:53.753
cmm0jga2j000dm3wi80snngdi	Md Zahid Alam	AI & Graphic Designer	Design & AI	Combines AI expertise with graphic design to deliver innovative visual solutions.	\N	5	t	2026-02-24 11:44:53.755	2026-02-24 11:44:53.755
cmm0jga2l000em3wihdjbsb59	Kaifee	Data Analyst	Data Analytics	Analyzes data insights to drive strategic business decisions and optimization.	\N	6	t	2026-02-24 11:44:53.758	2026-02-24 11:44:53.758
cmm0jga2n000fm3wijfypthbs	Danish Shamim	Full Stack Developer	Development	Develops end-to-end solutions with expertise in both frontend and backend technologies.	\N	7	t	2026-02-24 11:44:53.76	2026-02-24 11:44:53.76
cmm0jga2q000gm3wicggghtgu	Shadan Ahmad	Social Media Manager & Video Editor Expert	Digital Marketing	Manages social media presence and creates expert-level video content for engagement.	\N	8	t	2026-02-24 11:44:53.762	2026-02-24 11:44:53.762
cmm0jga2s000hm3wixhvjg0vo	Shadan Ghayas	PR Manager	Public Relations	Manages company communications and public relations to build brand reputation.	\N	9	t	2026-02-24 11:44:53.764	2026-02-24 11:44:53.764
cmm0jga2u000im3wii82vhtpq	Mobeen	Sales Executive	Sales	Drives business growth through strategic sales initiatives and client relationship building.	\N	10	t	2026-02-24 11:44:53.766	2026-02-24 11:44:53.766
cmm0jga2w000jm3wiiu2owdvt	Md Junnaid Ashrafi	Business Analyst	Business Analysis	Analyzes business processes and market trends to drive strategic decision-making and operational improvements.	\N	11	t	2026-02-24 11:44:53.768	2026-02-24 11:44:53.768
cmm0jga2y000km3wizip54w27	Ayush Arya	Content Creator	Content Creation	Creates engaging and creative content across various platforms to build brand presence and audience engagement.	\N	12	t	2026-02-24 11:44:53.77	2026-02-24 11:44:53.77
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, name, company, role, content, rating, avatar, "beforeMetric", "afterMetric", "isActive", "order", "createdAt", "updatedAt") FROM stdin;
cmm0jga8c0026m3wi18fkm0rb	Rajesh Kumar	Bihar Tech Solutions	CEO	Sovereon transformed our digital presence completely. Their AI-powered SEO strategy increased our organic traffic by 150% in just 3 months.	5	\N	500 monthly visitors	1,250 monthly visitors	t	1	2026-02-24 11:44:53.964	2026-02-24 11:44:53.964
cmm0jgaa10027m3wipxlq41r9	Priya Sharma	Wellness Hub	Founder	The team at Sovereon is exceptional. Their 24/7 support and ROI-focused approach helped us achieve a 40% increase in online sales.	5	\N	2% conversion rate	5.5% conversion rate	t	2	2026-02-24 11:44:54.025	2026-02-24 11:44:54.025
cmm0jgaa30028m3wijq3m6wdr	Amit Patel	Patel Enterprises	Director	Working with Md Faizan and the technical team was a game-changer. Our custom software solution streamlined operations by 60%.	5	\N	10 hours/day manual work	4 hours/day automated	t	3	2026-02-24 11:44:54.028	2026-02-24 11:44:54.028
cmm0jgaa50029m3wi5jkddur9	Sneha Gupta	Fashion Forward	Marketing Head	Their social media marketing expertise is unmatched. We gained 50K followers in 6 months with their AI-driven content strategy.	5	\N	5K followers	55K followers	t	4	2026-02-24 11:44:54.03	2026-02-24 11:44:54.03
cmm0jgaa8002am3wihxtdams6	Vikram Singh	Singh Constructions	Owner	Altamash Khan and the CRM team provided outstanding support. Our customer satisfaction scores improved dramatically.	5	\N	72% satisfaction	94% satisfaction	t	5	2026-02-24 11:44:54.032	2026-02-24 11:44:54.032
cmm0jgaaa002bm3wiju8tf6nk	Neha Verma	EduLearn Platform	Co-founder	The mobile app they developed exceeded our expectations. User engagement increased by 200% within the first quarter.	5	\N	1,000 daily active users	3,000 daily active users	t	6	2026-02-24 11:44:54.034	2026-02-24 11:44:54.034
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, "firstName", "lastName", "companyName", phone, name, avatar, provider, role, "emailVerified", status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: case_studies case_studies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_studies
    ADD CONSTRAINT case_studies_pkey PRIMARY KEY (id);


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: current_projects current_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.current_projects
    ADD CONSTRAINT current_projects_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: future_quests future_quests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.future_quests
    ADD CONSTRAINT future_quests_pkey PRIMARY KEY (id);


--
-- Name: global_settings global_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_settings
    ADD CONSTRAINT global_settings_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: page_contents page_contents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_contents
    ADD CONSTRAINT page_contents_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: services_cms services_cms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_cms
    ADD CONSTRAINT services_cms_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: admin_users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_users_username_key ON public.admin_users USING btree (username);


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: blog_posts_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);


--
-- Name: case_studies_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX case_studies_slug_key ON public.case_studies USING btree (slug);


--
-- Name: global_settings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX global_settings_key_key ON public.global_settings USING btree (key);


--
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: invoices_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_orderId_key" ON public.invoices USING btree ("orderId");


--
-- Name: invoices_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_userId_idx" ON public.invoices USING btree ("userId");


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_serviceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_serviceId_idx" ON public.orders USING btree ("serviceId");


--
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- Name: page_contents_page_section_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX page_contents_page_section_key ON public.page_contents USING btree (page, section);


--
-- Name: payments_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_invoiceId_idx" ON public.payments USING btree ("invoiceId");


--
-- Name: payments_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_orderId_idx" ON public.payments USING btree ("orderId");


--
-- Name: payments_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_userId_idx" ON public.payments USING btree ("userId");


--
-- Name: service_categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX service_categories_slug_key ON public.service_categories USING btree (slug);


--
-- Name: services_cms_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "services_cms_categoryId_idx" ON public.services_cms USING btree ("categoryId");


--
-- Name: services_cms_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX services_cms_slug_key ON public.services_cms USING btree (slug);


--
-- Name: services_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX services_slug_key ON public.services USING btree (slug);


--
-- Name: subscriptions_serviceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subscriptions_serviceId_idx" ON public.subscriptions USING btree ("serviceId");


--
-- Name: subscriptions_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subscriptions_userId_idx" ON public.subscriptions USING btree ("userId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: services_cms services_cms_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_cms
    ADD CONSTRAINT "services_cms_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.service_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Kd6lIslaIfejDMcdkirq37b4PsqyowYS9EhWFn1hIarQcBOmfuLpy7mdyld8Qub

