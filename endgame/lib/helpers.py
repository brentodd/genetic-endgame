import datetime
import locale
def current_date(datetype=''):
    ''' Returns just the month, day, or year of todays date.
    
    If type isn't specified it will just return today's date formated
    MM/DD/YYYY
    
    :param datetype: One of the following values:
    * year
    * month
    * day
    '''
    
    today = datetime.date.today()
    
    if not datetype:
        return today.strftime('%m/%d/%Y')
    
    format = {'year':today.year,
              'month':today.month,
              'day':today.day}
    
    return format[datetype.lower()]

def format_currency(num, sym=True, grp=True):
    '''Formats the number as currency.
    
    Defaults to US currency.
    
    :param num: the value to format.
    :param sym: whether to inlcude currency symbol.
    :param grp: whether to separate thousands by a comma.
    
    >>> format_currency(12345)
    '$12,345.00'
    '''
    if not num:
        return '$0.00'
    try:
        num = float(num)
        try:
            locale.setlocale(locale.LC_ALL, 'en_US.utf8')
        except (ValueError, locale.Error): #pragma: No Cover
            locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

        return locale.currency(num, symbol=sym, grouping=grp)
    except (locale.Error, TypeError, ValueError):
        log.error(traceback.format_exc())
        return '$%.2f' % num
