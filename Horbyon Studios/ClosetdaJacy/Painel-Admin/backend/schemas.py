from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: Decimal
    estoque: int
    categoria: Optional[str] = None


class ProdutoCreate(ProdutoBase):
    pass


class Produto(ProdutoBase):
    id: int
    imagem: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UsuarioBase(BaseModel):
    username: str


class UsuarioCreate(UsuarioBase):
    password: str
