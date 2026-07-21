create table officials (
  uniqid text primary key,
  barangay_code text not null,
  role text not null default 'official',
  created_at timestamptz not null default now()
);

insert into officials (uniqid, barangay_code, role)
values ('MVPCBEUVCGPZR', '0105503021', 'official');
