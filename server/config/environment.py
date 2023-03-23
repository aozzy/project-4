import os
db_URI = os.getenv('DATABASE_URL','postgresql://baggle_user:iXp0xlTOeweIiczWTSwI4yVZP1PxQuoM@dpg-cge2om82qv2bbhmk5u6g-a.frankfurt-postgres.render.com/baggle')
secret = os.getenv('SECRET', 'vjkh45kjhekghknhe5knvknkl5thvzhahgqn')
#'postgres://localhost:5432/barter_db'

# render db below for external connections use the internal connection string you get from render  when adding to the environment tab in render 
# when deploying the app you need add sql to the end i.e  postgresql:/ 
# postgres://baggle_user:iXp0xlTOeweIiczWTSwI4yVZP1PxQuoM@dpg-cge2om82qv2bbhmk5u6g-a.frankfurt-postgres.render.com/baggle 