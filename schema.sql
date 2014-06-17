--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: availability; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE availability (
    id bigint NOT NULL,
    created timestamp without time zone NOT NULL,
    availability character varying(100),
    track_inventory character varying(100),
    current_stock_level integer NOT NULL,
    low_stock_level integer NOT NULL,
    product_id integer NOT NULL,
    product_item_type character varying(100)
);


ALTER TABLE public.availability OWNER TO postgres;

--
-- Name: availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE availability_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.availability_id_seq OWNER TO postgres;

--
-- Name: availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE availability_id_seq OWNED BY availability.id;


--
-- Name: brand; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE brand (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.brand OWNER TO postgres;

--
-- Name: brand_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE brand_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.brand_id_seq OWNER TO postgres;

--
-- Name: brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE brand_id_seq OWNED BY brand.id;


--
-- Name: condition; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE condition (
    id integer NOT NULL,
    condition character varying(100) NOT NULL
);


ALTER TABLE public.condition OWNER TO postgres;

--
-- Name: condition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE condition_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.condition_id_seq OWNER TO postgres;

--
-- Name: condition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE condition_id_seq OWNED BY condition.id;


--
-- Name: event_date; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE event_date (
    id bigint NOT NULL,
    required boolean NOT NULL,
    name text,
    is_limited boolean NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    product_id integer NOT NULL,
    created timestamp without time zone,
    product_item_type character varying(100)
);


ALTER TABLE public.event_date OWNER TO postgres;

--
-- Name: event_date_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE event_date_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.event_date_id_seq OWNER TO postgres;

--
-- Name: event_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE event_date_id_seq OWNED BY event_date.id;


--
-- Name: gps_age_group; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gps_age_group (
    id integer NOT NULL,
    age character varying(50) NOT NULL
);


ALTER TABLE public.gps_age_group OWNER TO postgres;

--
-- Name: gps_age_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gps_age_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gps_age_id_seq OWNER TO postgres;

--
-- Name: gps_age_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gps_age_id_seq OWNED BY gps_age_group.id;


--
-- Name: gps_category; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gps_category (
    id integer NOT NULL,
    category character varying(100) NOT NULL
);


ALTER TABLE public.gps_category OWNER TO postgres;

--
-- Name: gps_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gps_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gps_category_id_seq OWNER TO postgres;

--
-- Name: gps_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gps_category_id_seq OWNED BY gps_category.id;


--
-- Name: gps_colour; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gps_colour (
    id integer NOT NULL,
    colour character varying(100) NOT NULL
);


ALTER TABLE public.gps_colour OWNER TO postgres;

--
-- Name: gps_colour_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gps_colour_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gps_colour_id_seq OWNER TO postgres;

--
-- Name: gps_colour_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gps_colour_id_seq OWNED BY gps_colour.id;


--
-- Name: gps_gender; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gps_gender (
    id integer NOT NULL,
    gender character varying(50) NOT NULL
);


ALTER TABLE public.gps_gender OWNER TO postgres;

--
-- Name: gps_gender_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gps_gender_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gps_gender_id_seq OWNER TO postgres;

--
-- Name: gps_gender_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gps_gender_id_seq OWNED BY gps_gender.id;


--
-- Name: gps_material; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gps_material (
    id integer NOT NULL,
    material character varying(100) NOT NULL
);


ALTER TABLE public.gps_material OWNER TO postgres;

--
-- Name: gps_material_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gps_material_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gps_material_id_seq OWNER TO postgres;

--
-- Name: gps_material_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gps_material_id_seq OWNED BY gps_material.id;


--
-- Name: gps_size; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gps_size (
    id integer NOT NULL,
    size character varying(20) NOT NULL
);


ALTER TABLE public.gps_size OWNER TO postgres;

--
-- Name: gps_size_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gps_size_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gps_size_id_seq OWNER TO postgres;

--
-- Name: gps_size_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gps_size_id_seq OWNED BY gps_size.id;


--
-- Name: pricing; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE pricing (
    id bigint NOT NULL,
    created timestamp without time zone NOT NULL,
    price integer DEFAULT 0 NOT NULL,
    costprice integer DEFAULT 0 NOT NULL,
    retailprice integer DEFAULT 0 NOT NULL,
    saleprice integer DEFAULT 0 NOT NULL,
    fixed_shipping_cost integer DEFAULT 0 NOT NULL,
    free_shipping boolean,
    product_id integer NOT NULL,
    product_item_type character varying(100)
);


ALTER TABLE public.pricing OWNER TO postgres;

--
-- Name: pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE pricing_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pricing_id_seq OWNER TO postgres;

--
-- Name: pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE pricing_id_seq OWNED BY pricing.id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE product (
    id integer NOT NULL,
    name text NOT NULL,
    type character(1) DEFAULT NULL::bpchar,
    sku character varying(50),
    bin_picking_number text,
    option_set text,
    option_set_align character varying(100),
    description text,
    warranty text,
    width integer,
    height integer,
    depth integer,
    allow_purchases boolean,
    is_visible boolean,
    show_product_condition boolean,
    category text,
    image_url_1 text,
    image_url_2 text,
    image_url_3 text,
    image_url_4 text,
    image_url_5 text,
    search_keywords text,
    page_title text,
    meta_keywords text,
    meta_description text,
    myob_asset_account text,
    myob_income_account text,
    myob_expenditure_account text,
    sort_order integer,
    ean character varying(13),
    stop_processing_rules boolean,
    product_url text,
    redirect_old_url boolean,
    gps_gtin text,
    gps_manufacturer_part_number text,
    gps_gender_id integer,
    gps_age_group_id integer,
    gps_colour_id integer,
    gps_size_id integer,
    gps_material_id integer,
    gps_pattern text,
    gps_item_group_id text,
    gps_category_id integer,
    gps_enabled boolean,
    image_url_6 text,
    product_tax_class_id integer,
    brand_id integer,
    condition_id integer,
    weight integer,
    item_type character varying(100)
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_sku; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE product_sku (
    product_id integer NOT NULL,
    sku_product_id integer NOT NULL,
    product_item_type character varying(100) NOT NULL,
    sku_item_type character varying(100) NOT NULL
);


ALTER TABLE public.product_sku OWNER TO postgres;

--
-- Name: product_tax_class; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE product_tax_class (
    id integer NOT NULL,
    tax_class text
);


ALTER TABLE public.product_tax_class OWNER TO postgres;

--
-- Name: product_tax_class_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE product_tax_class_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_tax_class_id_seq OWNER TO postgres;

--
-- Name: product_tax_class_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE product_tax_class_id_seq OWNED BY product_tax_class.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY availability ALTER COLUMN id SET DEFAULT nextval('availability_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY brand ALTER COLUMN id SET DEFAULT nextval('brand_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY condition ALTER COLUMN id SET DEFAULT nextval('condition_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY event_date ALTER COLUMN id SET DEFAULT nextval('event_date_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gps_age_group ALTER COLUMN id SET DEFAULT nextval('gps_age_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gps_category ALTER COLUMN id SET DEFAULT nextval('gps_category_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gps_colour ALTER COLUMN id SET DEFAULT nextval('gps_colour_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gps_gender ALTER COLUMN id SET DEFAULT nextval('gps_gender_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gps_material ALTER COLUMN id SET DEFAULT nextval('gps_material_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gps_size ALTER COLUMN id SET DEFAULT nextval('gps_size_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY pricing ALTER COLUMN id SET DEFAULT nextval('pricing_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product_tax_class ALTER COLUMN id SET DEFAULT nextval('product_tax_class_id_seq'::regclass);


--
-- Name: availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY availability
    ADD CONSTRAINT availability_pkey PRIMARY KEY (id);


--
-- Name: brand_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY brand
    ADD CONSTRAINT brand_name_key UNIQUE (name);


--
-- Name: brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY brand
    ADD CONSTRAINT brand_pkey PRIMARY KEY (id);


--
-- Name: condition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY condition
    ADD CONSTRAINT condition_pkey PRIMARY KEY (id);


--
-- Name: event_date_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY event_date
    ADD CONSTRAINT event_date_pkey PRIMARY KEY (id);


--
-- Name: gps_age_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_age_group
    ADD CONSTRAINT gps_age_pkey PRIMARY KEY (id);


--
-- Name: gps_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_category
    ADD CONSTRAINT gps_category_pkey PRIMARY KEY (id);


--
-- Name: gps_colour_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_colour
    ADD CONSTRAINT gps_colour_pkey PRIMARY KEY (id);


--
-- Name: gps_gender_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_gender
    ADD CONSTRAINT gps_gender_pkey PRIMARY KEY (id);


--
-- Name: gps_material_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_material
    ADD CONSTRAINT gps_material_pkey PRIMARY KEY (id);


--
-- Name: gps_size_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_size
    ADD CONSTRAINT gps_size_pkey PRIMARY KEY (id);


--
-- Name: pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY pricing
    ADD CONSTRAINT pricing_pkey PRIMARY KEY (id);


--
-- Name: product_id_item_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_id_item_type_key UNIQUE (id, item_type);


--
-- Name: product_sku_product_id_sku_product_id_product_item_type_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY product_sku
    ADD CONSTRAINT product_sku_product_id_sku_product_id_product_item_type_sku_key UNIQUE (product_id, sku_product_id, product_item_type, sku_item_type);


--
-- Name: product_tax_class_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY product_tax_class
    ADD CONSTRAINT product_tax_class_pkey PRIMARY KEY (id);


--
-- Name: tax_class_uq; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY product_tax_class
    ADD CONSTRAINT tax_class_uq UNIQUE (tax_class);


--
-- Name: uq; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY condition
    ADD CONSTRAINT uq UNIQUE (condition);


--
-- Name: uq_age; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_age_group
    ADD CONSTRAINT uq_age UNIQUE (age);


--
-- Name: uq_cat; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_category
    ADD CONSTRAINT uq_cat UNIQUE (category);


--
-- Name: uq_colour; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_colour
    ADD CONSTRAINT uq_colour UNIQUE (colour);


--
-- Name: uq_gender; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_gender
    ADD CONSTRAINT uq_gender UNIQUE (gender);


--
-- Name: uq_material; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_material
    ADD CONSTRAINT uq_material UNIQUE (material);


--
-- Name: uq_size; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gps_size
    ADD CONSTRAINT uq_size UNIQUE (size);


--
-- Name: availability_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY availability
    ADD CONSTRAINT availability_product_id_fkey FOREIGN KEY (product_id, product_item_type) REFERENCES product(id, item_type);


--
-- Name: event_date_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY event_date
    ADD CONSTRAINT event_date_product_id_fkey FOREIGN KEY (product_id, product_item_type) REFERENCES product(id, item_type);


--
-- Name: pricing_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY pricing
    ADD CONSTRAINT pricing_product_id_fkey FOREIGN KEY (product_id, product_item_type) REFERENCES product(id, item_type);


--
-- Name: product_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brand(id);


--
-- Name: product_condition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES condition(id);


--
-- Name: product_gps_age_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_gps_age_id_fkey FOREIGN KEY (gps_age_group_id) REFERENCES gps_age_group(id);


--
-- Name: product_gps_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_gps_category_id_fkey FOREIGN KEY (gps_category_id) REFERENCES gps_category(id);


--
-- Name: product_gps_colour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_gps_colour_id_fkey FOREIGN KEY (gps_colour_id) REFERENCES gps_colour(id);


--
-- Name: product_gps_gender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_gps_gender_id_fkey FOREIGN KEY (gps_gender_id) REFERENCES gps_gender(id);


--
-- Name: product_gps_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_gps_material_id_fkey FOREIGN KEY (gps_material_id) REFERENCES gps_material(id);


--
-- Name: product_gps_size_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_gps_size_id_fkey FOREIGN KEY (gps_size_id) REFERENCES gps_size(id);


--
-- Name: product_product_tax_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_product_tax_class_id_fkey FOREIGN KEY (product_tax_class_id) REFERENCES product_tax_class(id);


--
-- Name: product_sku_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product_sku
    ADD CONSTRAINT product_sku_product_id_fkey FOREIGN KEY (product_id, product_item_type) REFERENCES product(id, item_type);


--
-- Name: product_sku_sku_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY product_sku
    ADD CONSTRAINT product_sku_sku_product_id_fkey FOREIGN KEY (sku_product_id, sku_item_type) REFERENCES product(id, item_type);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

