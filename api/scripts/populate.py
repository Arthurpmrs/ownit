from sqlalchemy import func, select

from src.core.db import get_engine
from src.features.auth.service import create_student
from src.features.auth.tables import students


def populate():
    with get_engine().begin() as conn:
        count = conn.execute(select(func.count()).select_from(students)).scalar()

        if count is not None and count > 0:
            return

        create_student(conn, 'student@ownit.com', 'Student123', name='Student')


if __name__ == '__main__':
    populate()
