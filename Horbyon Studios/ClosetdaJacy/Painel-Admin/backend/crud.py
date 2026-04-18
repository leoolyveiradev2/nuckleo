from sqlalchemy.orm import Session
from models import Produto, Usuario
from schemas import ProdutoCreate
import os
import shutil
from fastapi import UploadFile, File
from utils import verify_password


def get_produtos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Produto).offset(skip).limit(limit).all()


def get_produto(db: Session, produto_id: int):
    return db.query(Produto).filter(Produto.id == produto_id).first()


def create_produto(db: Session, produto: ProdutoCreate, imagem: UploadFile = None):
    db_produto = Produto(**produto.dict())
    if imagem:
        filename = f"img_{produto.nome}_{produto.preco}.jpg".replace(" ", "_")[:100]
        path = f"../uploads/{filename}"
        with open(path, "wb") as buffer:
            shutil.copyfileobj(imagem.file, buffer)
        db_produto.imagem = filename
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto


def update_produto(db: Session, produto_id: int, produto: ProdutoCreate):
    db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if db_produto:
        for key, value in produto.dict().items():
            setattr(db_produto, key, value)
        db.commit()
        db.refresh(db_produto)
    return db_produto


def delete_produto(db: Session, produto_id: int):
    db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if db_produto:
        db.delete(db_produto)
        db.commit()
        return True
    return False


def authenticate_usuario(db: Session, username: str, password: str):
    user = db.query(Usuario).filter(Usuario.username == username).first()
    if not user or not verify_password(password, user.password):
        return False
    return user
