from database import engine, Base
import models  # IMPORTANTE!

Base.metadata.create_all(bind=engine)

print("Tabelas criadas!")