from setuptools import setup, find_packages
setup(
    name="endgame",
    version="0.1",
    packages=find_packages(),
    entry_points={
            'console_scripts': [
                'runserver = endgame.app:runserver',
            ],
        },
)
