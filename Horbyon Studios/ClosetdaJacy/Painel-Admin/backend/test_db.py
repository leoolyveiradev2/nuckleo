from sqlalchemy import create_engine

engine = create_engine(
    "mysql+pymysql://admin:admin1234@localhost:3306/painel_admin"
)

with engine.connect() as conn:
    print("CONECTOU!")