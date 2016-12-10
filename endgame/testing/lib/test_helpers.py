import datetime

from endgame.lib.helpers import current_date, format_currency

def test_current_date():
    def check_val(result, expected):
        assert result == expected
    expected = datetime.date.today()
    y = expected.year
    m = expected.month
    d = expected.day
    expected = expected.strftime('%m/%d/%Y')
    yield check_val, current_date(), expected
    yield check_val, current_date('year'), y
    yield check_val, current_date('month'), m
    yield check_val, current_date('day'), d

def test_format_currency():
    def check_val(inp, sym, grp, expected):
        assert format_currency(inp, sym, grp) == expected
    
    tests = [('1234', '$1,234.00', True, True),
             ('123.44', '$123.44', True, True),
             ('1234', '1,234.00', False, True),
             ('1234', '$1234.00', True, False),
             ('1234', '1234.00', False, False)
            ]
    for inp, expected, sym, grp in tests:
        yield check_val, inp, sym, grp, expected
    try:
        v = format_currency('asdf')
        assert False, 'Did not throw an exception when it should'
    except:
        assert True
