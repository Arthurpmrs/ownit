from sqlalchemy.dialects.postgresql import insert

from src.core.db import engine
from src.features.auth.tables import students


def seed():
    stmt = insert(students).values(name='admin', email='admin@admin.com')
    do_nothing_stmt = stmt.on_conflict_do_nothing(index_elements=['id'])

    with engine.begin() as conn:
        conn.execute(do_nothing_stmt).fetchone()


if __name__ == '__main__':
    seed()
