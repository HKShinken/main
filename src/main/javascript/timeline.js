var mysql = require('mysql2');

function main(params)
{
	return new Promise((resolve, reject) => {
	var con = mysql.createConnection({
				  host: "172.1.0.8",
				  port: "3306",
				  user: "home",
				  password: "locale",
				  database: "sys"
				});
	

	var post_id = params.pid; //post su cui porre eventualmente il focus
	
	
	var operator = "=";
	
	if(params.b == 0 || params.b == null )
	   operator = "<=";
   else operator = ">=";
   
	if(post_id == null) //nel caso nessun pid si legge dalll'ultimo post pubblicato dall'utente
	{
		operator = "<="; // se il post_id è null, mostro i primi 9 in assoluto
	    post_id = Number.MAX_SAFE_INTEGER;
	}
	
	
    var values = [params.username, post_id]

    var sqlSession = "select count(*) as cnt from user_session where username = ?";

    //La timeline è suddivida in pagine contenenti massimo 7 posts
	var sql = "select * from (select max(post_id) over (partition by username) as max_pid, min(post_id) over (partition by username) as min_pid, post_id, username, post_imgb64, filtered_post_description, ifnull(likes_list,'') likes_list, ifnull(cnt ,0) as cnt, update_date from sys.users_posts src left join ( select post_id as post_id_l, GROUP_CONCAT(action_user) likes_list, count(*) as cnt from (select * from sys.users_post_actions where action_type = 'L' order by insert_date desc) src group by post_id  ) detail on src.post_id = detail.post_id_l ) M where username = ? and update_date is not null and post_id " + operator + " ? order by update_date desc";
	
	//controllo sessione attiva
	con.query(sqlSession,values, function (err, resultSession, fields) {
										if (err) throw err;

			if(resultSession[0].cnt == 0)
			{
				resolve
				({
					headers: {
					  'Content-Type': 'text/html'
					},
					statusCode: 403,
					body : '<html><body><h1>NOT LOGGED</h1></body></html>'
				})
			}	
			else
			{
				con.query(sql,values, function (err, result, fields) {
											if (err) throw err;
											//console.log(result);
											
											//parte iniziale della pagina
											var resultPage =  '<html><head><style> .center { color: rgba(140, 80, 80, 0.9); display: block; margin-left: auto; margin-right: auto; width: 50%; } .tinycircle { margin-left: 1; clip-path: circle(); } .spacing { margin: 8px 8px 0px 0px; } /*a { text-decoration: none; }*/ </style>'
															+ '<script >'
															+ '	function showElement(id) {'
															+ '		  var x = document.getElementById(id);'
															+ '		  if (x.hidden == true) x.hidden = false;'
															+ '		  else x.hidden = true;'
															+ '	}'
															+ ' </script>'
															+ ' </head>'
															+ ' <body class="center" >'
															+ '	<hr size="4" width="75%" align="left" noshade/>'
															+ '	<div>'
															+ '		<h1> Ciao ' + params.username +', ecco la tua Timeline </h1>'
															+ '		<h4><a href="ADD_POST?user=' + params.username +'">AGGIUNGI POST</a></h4>'
															+ '		<h4><a href="USER_GRID?username=' + params.username +'">BACHECA</a></h4>'
															+ '		<h4><a href="FEED?username=' + params.username +'">IL TUO FEED</a></h4>'
															+ '		<input type=button value="LOGOUT" onClick="window.location.href=\'LOGOUT?username=' + params.username + '\'">'
															+ '	<div>'
															+ '	<hr size="4" width="75%" align="left" noshade/>'
															+ '	PLACEHOLDER_PREV'
															+ '	PLACEHOLDER_NEXT';
															
											//costruzione div intermedi per ciascun post dell'utente considerato
											var i = -1;
											for(i = 0; i < result.length && i < 7 ; i++)
											{
												 imgSrc = "data:image/" + result[i].file_ext + ";base64," + result[i].post_imgb64.toString()
												 loopPid = result[i].post_id;
												 description = result[i].filtered_post_description;
												//console.log(result[i].username, imgSrc)
												
												var testoLike = 'Nessun like';
												
												var listaProfili = "";
												var arrayProfili = null;
												
												var timelinePage = "<a href=\"TIMELINE?username=" + params.username + "\">";
												var profilePage = "<a href=\"PROFILE?username=" + params.username + "&profile=";
												
												var imgLikeButtonOff = "data:image/png;base64,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";
												var imgLikeButtonOn = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJgAAACICAYAAAAbFCK6AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAACAaSURBVHhe7Z0HmBRV1obPwMAwwCA5R0XBNQeSIlEWc8CEa0J3RQT8EVFh14yI6CIISlB/1N1VjAv+4iooAo8gKBmUoOQlxyFIhpm/3jN925qarg4z3TPdPfU9T02Fqa664bvfOffcW1Up2RbEg4cYoYRv7cFDTOARzENM4RHMQ0zhEcxDTOERzENM4RHMQ0zhEcxDTOERzENM4RHMQ0zhEcxDTFGkBMvKyhJvpCp2MOXLuqgQt2ORJMssFFDJkiWlRIkSun/8+HE5efKkpKam6mLOB5wTKbh+fn4XLdgb2rFjxzSvJr8G5Jdj4MSJE/7z0tLSJCUlRY+7gWuHOidWiDuCUXgkiXVmZqbs2rVLdu7cKVu3btX1vn375MCBA/5KKV26tFSoUEHKlSsnNWvWlNq1a0v16tWlUqVKetwQkPOKEhCESmZt9vfv3y/bt2+X3bt3+9csBw8eVALRkCBQRkaG5qdq1aqat2rVqum6cuXK+v+jR49qPg0B4wlxQzCSQQWsWbNGPv30U/nmm29k9erVWuAAwplWbSrJtEp+a8wAxzinXr16cs4558jVV18tnTp10kri92XLltXzCgOGVKSH9EEaiDR9+nSZMGGCLF26VEl26NAhzR9pK1OmjBLL5AeQP9PwQHp6ulSpUkVOP/10zdvNN9+s+TW/KUo1dqJICUYFoEhz586VyZMny7x582TVqlVa4FQMhOAckmgKLVAhmixwjG3zG3OsYsWK0qRJE2ndurVcfvnl0qpVK7+yxQrGhP3222+yaNEizd93330nmzZtUlW2p980FMA2ZDLbLOTFnGOOGfJSHuSvfv360rZtW+nQoYM0a9ZMTjnllLhQtEInGLejAPfs2aOF/tZbb8lPP/0kR44cUTOH3FNwpgI43040/sfakIkCZm2OGVPBPr9hm8ouVaqUv9IvueQS6dOnj7Rv317VIJogPSw0nGnTpsmoUaO0AZFu0mZPqz1fJr/2fAKzNv83+WXf5AdwDPD/li1byp///Gfp2LGjmlJzTlGg0AgGgSgsWu+7774r77//vpoLo1YsFBoLJMO3YBsFoGIgH2RgwYzgXwHOxSfDb+Fc9ilQfmMqg21IzT3MGpx//vnSpUsX6dGjR4FNJ/fh2pi8f/7znzJu3Dh//vgfeTGEMnllffjwYU0feSJv5cuXV3POMf4PiSi7vXv36rXY53osXA9zSuNh29yHMkDB8Nu6du0q999/v/pvXI/rFiYKhWAUCg77F198IcOGDZMNGzZoZrk1hWMKnTUFhPOKj3FTzdpyx/rNkrH/gO9KwXGiRnX5pf1lMj2jrCxbtkx+/fVX7RxQOcbJN/ehQqgIKvaiiy6SBx98UP019jknEpAP7vH999/LkCFDZMmSJXp9CA5Yc00WjkOkGjVqqA81ds4iPed49WpSasdO3bYjpW4dyd60WbJr15KULVt9R0X2pJeRj8qmyRt7dqhaGr+NfJqGxb1YTjvtNOnevbv6aoVtOmNOMDK7fPlyVQkKHgLRIqlIAMHYp9DpAU7fc0iPa8Fu3kLt6X4kSKlahRtL9p5MJd3khnXlxWVLlXCQ19wPRTCVQjqaN28ur732mtSpU0cVNBzwe0j80EMPydSpU/2kpVhRNCoe9eW8c889V3qed4F0mrtISm7bLpacSDaK6rtWQbA9taS8tG+3fC4nVRVRQvJHXtlGubj/0KFDtfPDPnURa0SdYFzOrgC0aPwQWjgthwLHHJF5QO+nz8XN5cblq6Q0v7WW7N179H8kLNLC5/xs7u/IFgqwvn0bGb1zq/pGONtUvP7Pdm7dunWlf//+cs011ygZA4HzUWWU8L333tNK43pUGv+zm7+GDRuq4/3CF1NF6tQWQYUcaQuFcMsh22okX51zpgxetUJ74xDdWAXSxYKp7Nevn9x5551qQmONqBGMy9iJtXHjRnnkkUdk0qRJ2oJo2bRilIKWzbHnr7hKuixeJik+QkULzgpR0uVsWjsp8tvjfeWZBTk9V/w2k3YWGgF+VN++feWpp57SSoI4drOCSeI3zz77rLz99tvaaDiPPKJ8qAYm/uFmLaTb5h1SYuu2nB9SPkGKO1c6LTjzAfzHglyLxvSferXkiR9na15IKySDbCykkQY0fPhwrQdjTZygvgqqclFXMFo23fLHHntM5s+fr8eMn0ViydzAzlfKTSvXSOr2Hfp/O+yF7CzwcOCvgFCwSGMxXXallZYXM3fKZ1k5owMsEIr1ZZddJi+99JL84Q9/8P0kp7Pwyy+/yIABAzRWRwVBKI4bP++Jdh3k3i07c/IXhAj5yR9w5tEtzydr1pBJdWrIo99NV7LQEIyPRmO49NJLZeTIkeqj2UlmGpxzOz+IKsEwe3PmzJHevXurI08lUQGoBOtb69STZ1LTpfTOXb5f5EZ+Czws2CvaUelZFnGGWXwbvmm9+maYNiqCSqADQCWceeaZqmIEf++9915ZsWKF3/RwnLxiDl/rdIWcO/lbybaUIxiiklcneZ37Phy1fNKRxw7JuJ3btMcNmUg7YsDox9ixYzVkU1C1CoSoEYxWQS+RLjEthYUeC2EJfC7M4e3zl4pVe75f/A5T2FEp9CCw34O1E5NOrS895/+gSgUgGmjatKl8/PHHam5uvfVWdeqpJKN2KNh1110nwy9pI+mvjHC9PohFHu33C3bvzLLpMtjqdU44cVQbD8pEQ8IvmzhxoubT5N0AehS5glHQDH/QU4RQtGgqB3OIL/LOJZfJWTNmW6n9ffgD2As7FgXvhhQrXdlWAeepDKuwp7duIT0n/0fjaqZF03gIKdDicebJHyYREI/D5N+w4CerBjM52bqodVVbsZq8FWYe8+TNB9T66eOH5MNDBzR/WB0TfyM+SZCW/WihwASjoInEX3nllWoKqQwuSSLblUqT0XUa5jGJ9oJ2K/RYVoZb4QPIt6RzR7nt0w81H+QJoMbE8vAnqRjWrSwujanbSMpm7tVz3GDuFav8BEPAvFoN5MkTh2X8b/t0F4FApVAyYnmsyV80UGCju27dOunVq5c/pmRkt0uNWvJmpRpByQXMtrMQYlkZbmkAKNu5n38pC2s2kNvSy6taUdgos3GQqZD2pcvIuKq185DLmQ9zr1jmJxhMenLd30r/oBJpMqJyDW1E5Im8bdu2TXuX+M/RQoEIxngiY3o4vCSUlm1s+uCS6VLCMjNOuBV0YVeAnWROwoH0PZnyjFUJd2RU1LxhCk0e/1guQ0aVryypDn/STq6AFVuEyJNHKy/XHs+S+6rW0Dzhk1F3CMbAgQM1bhkNFIhgRL1/+OEHNZMoFwmlxU+4/S5J3Zcjv3bYKyAeYCeBP202h7aEla9BaeXVlzQ+Gfkcc0q1XOSy58tcK16IZYc9nQZPnsgxjbgC1CMdFhx+4nuQrqDIN8E+//xzeeONN3QbicVHoQfy3oO9pN6Ez/W4HfFa6CBX2qyWbU8nJBtz5TXaa6TxTDq/uZRykMuQyiBe8xkIKVbdjep8lTr5KDQqhkswYsQIHeIrKCJy8jkV/4OCZvhjwYIFGo6ghUOynj17yoCvv5OsnXkHbRMBTqIY4Pi/3ri+3L52o1Q+YrVqX5E5yZVIxMqFkqkystttOuSFajGbA5/6ggsukK+++krFI7+hirAJxmksyOiYMWPkhRde0LgQ43nIKtHuKdssu01CwrtkXMNOHAWRbiufdiQ8sRy4+fR6snjxYnUHIBlBWYaTunXrpsrmjJGFg4gUDPVixmmbNm2U4UgpsSEY/nPJctbVLIvriHUBKiKhKyFJGk0wpFjkYWZH/cytao2wUqgWw0iELtiHYKwjQdg+mFGwTz75RMnFzUzE/qkOl4swYS8AuUAiVY09rf5tF3LlUrgEB+QCTDuinhEPguVr166V5557TomFwESKiEwkMySuuOIK2bJli5pKbsr44pDsUpLiC0gmAygQP3lc1CvhVTkIWmeU0jpGPCAaPvbs2bN1vl6kUf6wFAwzCEaPHi3r16/XfdNlH5hk5AKGXCnMF3OQy/wvWckFZh047g9RICwQjZkjKFikKhaSYOYGPJPITdg39vn6qtUlLcnIZUe2LVBcHIhlB09h4YsByDZ+/HjdBvAhXIQkGDdBJhcuXKhTjlEu/C9UbFBK6GnFpmISEYZMyWwO3fI1bfdBNY0Iiqn/mTNn+jt34SIkwfC1IBkPw2J/2dbpKVWqSTlbt92NSIlcMcVBtQLVGz1KgJBQ38bfhgMcg3ThIiTBsLkMgk6ZMkVVy5jHl9MyfGfkIJkrobjB9Ch/Ta+kdQ2hIBkzlFGwSPywkAQjwIY0MlYFwWAwN8vwOf7ATb3cjntIAPjMIATDVFLvzIUjkhAJQhIM8A4FHDvUizWBVTvc1MtTtcSCMY0KnyPPk1UIC0QjLoYlgwfhIiwTyZijcfYh2M216vj+6w5PvRIPxjQaMAbboEEDf0gKU8m0eLgQLkISDNOILEIuyAZ7/3ood0KcgFyeeiU+mHx5T6WcVw4gLBCN5y0JwoaLkATbsWOHThWGvUilzt+2zRMKpFQeuRIXqJYd1y1ZrsJiwhVMMo1kxmtIgq1cuVJvgCyiXs6HND0yJRdQLTuYD2cHPDAEC8dUhiQYQ0P0GpFHWMy7qKIJj6DxDyIJ1D0LIsNje4B9AzeyhSQYNheCAS7i9r6G/MJuYr2OQXyC2a4mPGXCFXZyAQQoEEISDAefH0MunD3zXq5YwFOz+ARWC+XCVYJg5n0XUTGRRPG5OBfj4rDZCU95khvEPQ25APEwCBbOmGRIgjGSjnIZH4yorhOe8iQ3zPvN4AEgmuBmEp0IeRYshVgm0Oah+IF6t9c9XDBkC4WQBGPyP/JoYBx+D8UHWDEjMsbRD8f/AkEJxkXoNXJxYyJx8DwULzCaY+ofgpkXJhtVswuQEyEJZl6zyA1gcLQeKfeQIGh2kY7kAGMWiSTYzSSdQDcEJRg/5J2lhr0w1bxtxkMxwZKfdA4YgAf45Lx73x4bNUoWCEEJxg95s5/pnsJYHsaU0rm/++O5/kkMq8fIg7hwwYhMrVq19F/sQzqzHQhBCQZL+ViBkUDWaiJtkw2BFwdLDpSoVs23lRvGsYdEKBYP46JkxkQGQ0CCGbZCKD4YQCSXfS5oXivpIfng9k4Ru4OPT47bZIfdH3PCVcFgKhcmsMrLbdkHHLuhUY5Eeig+MJF8XCZeHGxEiCUYgppIJpkhhVzUTJnmgnymJTuK7/H0ED9w0mWi5X4bsWG58MILI/qukyvBIBOyx0X5PBxrQzh6FSmeqUxKOA3do3tzXh1qnijjdefAmEU302jgSjCUigsCPkjAW/BgMnaY4yd9/8sDbhjiph4SB4gKgGT44xdffLE/RBEOXJ18s+ZifOySDymhYpALor1fIUcm81CJ35rf618P8Qx7HQWqL/wuhoqo+8aNG+vQYSQISDC7/EEols6dO/u3cfgGbfmvfnwpGIk8HYt/UEemDp31dfqhnG9IUeeYSCwZhINs4cKVYIALsaBkfCWWBz5MTITXB8w483Q9z0Niw00IMI/UN3xgeIhPUlP3kSAsKkKyRo0a6fuhIBuhC1Rs4Kb1eaL6HpIHRlwgFd+Y5J2t5ni4CPtMAmx8jwdwU27CAyEbWlykxzwkFxrs3ab1TNQAn5sPNACORYKwCYZM8pUxpu8QpqBXgYoN2LoRSvvO8pAsQECMq4QPxpstTTwsEkR0No+Ro2LcBHJxw9nz58vKTjmxEQ/JgSZH9vqtFPXMt8yp+0DT5UMhbIJxQxy+2267zd915Yaw/On1q/M8EawIFu33tY7IBNdDYYBJpagWU7MYh+ZbVPkhF4jIRMJoPtDZqlUrJRnH6E3ysfdfO7b1nWlDsGi/z5Y7ezAe4YoW+F6QinplTfSAGTX0KCP1v0DEn/PjRjw63rZtW90mIcgokf5FqeXzTOXJA5TLRi6PUIUHytrZoJ1ouG+7PzQB+NIH4QnqmGMxCVPYQa+CkMVNN92kE9Hww+Aojv83jRv6zgoCG589chUu7OQKVPZ1d2/WesQc8g6Se+65R4eGqGOIhdmMFBErGOAnP//8s9xwww1qp5mESK+Sh3JnXH29VJvyre/M8BFO6/IQW5x6YKeSCaVi1uqMGTPUMkWqWnZErGCABPCJ4X79+ql0omqYSqZTd1+2JF/BVye5PHWLLijfYGWK78VwEGD9wAMP6LhjQcgFIupF2oFi0aM0c/YJxNIJWL56tUxrcprvrNyIRKE8NYsuglkIlIuZytQfdYl/3bVr13z3HO2IqBdpB4kh6Priiy+qaTTsxy/rMXe2rOzcUfftiFSVPBXLJxx1FayxnnE4U0mFFWIBTzzxRIFNo0G+TKQBqtaiRQvp3bu3PyiHI0gv5O4ZUws8TumpWIQwxLJZG464PYP9WakUFQYce+qShY9hMcHUzAMrKPLl5NuB77Vv3z7505/+JHPmzNHeB3KLvD5Tr5Hcs9d7jrKoALlM5bJ2Ntg6uzZpPUEBrNFZZ50lH3/8sVqrSD965YaICMapTlMJUCx6lXfddZd+bgapRV6J9k+8pI00/3Wt78wcBMqsHc7/hzrfgzvcyo54F3WJUlFfEOrrr7/WR9LYxiJFAxFdJRC5AGRiOsdjjz2m55A4Es76noVzJcvYct/v+WtYbdZ2OO8S+K4egsGUWa533/vQKjVnyjMuDcCt+cc//qEKxquaokUuEL0rWSAu9uijj+q2Ecaj1nrY4QO6bR3MWVvwF4BvHRIWOQOR0UMOTNmklM5x1HWfBm1ZFzs+TTkpazdtUiHAvcFEPvjgg/oN9mgSy6DAPpgdmEoCr3fccYf6Y6gYgTsysbxcFQno8lMI0UuChyD4KOuY/PXgPiWWcWMYBnr77belmstT3QVFgSgLeewgwbxu8c0339SPxCPBkIsMvXYi58tseagUilw+s2qHR8cgCFBeJ2vXkqurV5Anj/ymdUHMksaPvzV48GD/G5RigQIRDEl1kgzpZZhhyJAhuqYbDMlGHMiUxgd3y/iqFSMjSAAChm1WiyOc5VWvjtyeUVpWrFmjpKIu+JjCqaeeKsOGDZMzzjgjX2OM4aLARjeQ3eZYy5YtZejQofoUMIFYQ8ZHly+VCXVr6nmREM15bkQkTUYYpXIqFvu+Yyl/vFxuLnFCFi1apGWPeuHGYGkIpvKUECMybp23aCCqPpgTXHrs2LHy+OOPaytBzYiT0ZJev7C5XLv2v74zc4MEBcwyBRG75CYXUCXLReHRM0hF2dPYIRNmsVu3bkquWCP63QYbyAzz+J977jn1x5jAxlAS2wwnTT2rSUAlglwBaVTMyRVJ7mfXrKrkotNFPaBalP3DDz8s9913X6GQC8SUYCgYvZWePXvqtFtsPz4AC5l+4Mfv5eumjV1JFg6KDeWs8spVJta+H/ZtC/Ma1pVuq1f6wxCYRwjWp08fJVgsfS4nYmoigbk8Et23b1/517/+pQqGT0bEmEJ4t00Hab90uZ6XBwzAWibVgzsoYUMxyHXbT4u0jCES5YxLwgTRMWPGqIsSS5/LiZgTzA7kmnlGEyZM0IgxGacAIN+bLVvLlY4hJQ8WIEMEVcTUG8yfee0lc7p4KuiVV16JaTjCDYVKMMDAuFEynE7jfNLiXrugmVy9er3vzMhgb8VJCRvR3PLaaP8ONYdUqVEv5nbR0eKlcUWBQicY4LEoPrJFHOazzz5TJTPLO5e1zzfJijPq7dmi/i6gsZoo/aRJk5RwhWkW7SgSghlAqB49esi///1vbXm0OtavnnuhXL9+k+8sGyI0FwmPMPNbP/P37zeiWvhZbdq0kddff93/RuiiQkx7kQZuHKbFId933nmn7kM4ej30Lj+rU0OPAX/bM9exfmeu6Lxy6OpIIIQg1zcVy/t9LhQKV4NGCrlwQapUqeI783cUtp4UqYIZQCwmvOGPQTCSxFyyTpb/8L/lK0va/IW+Mx0oJoqWksJbbrJy5ffHihXk7m3/VWcegqH8kIyJn/3799c3QWMmixqFomChgJKNHz9eyUXUGR+CoOy0WbPkurUrZf85Z/nOdCCJyKU5gUBOWCRRcgFffn9IT5O7NqzSXjnDcJCLsuMhnEGDBukbKQsz1hUMcUEwcO2118pbb72lZDNRZ1rkGqszcM3q5fo2xaBwVE5CUc9Ku6be2WBQINt8rt0d2kjLQ3ukq6VcqZY5JI6oX16xQHR+9OjR/gmDReXUO1HyWQu+7SLH2WefbZVxtvz4449aSLRC5vcf4h2hFsFahNEeqCKKNj6K1x0mna5wkGt9swvk6jkzJfPIEVUslB6gYIz1EvqhYaJk8YS48MGcYPou068hF4VJwdEie6VnSL/UMr6zgoDWG8/m0yV9EC5Qqledf7Z0nP6N3+zhs1IeBFH/9re/6VAcbkW8kQvEjYm0A0d1+PDh+lUvQOGBYXt36burpjRtrPsGeeadxyG5cqXInj6bKQuU6rkN6qhyQSgW8/I/OkV///vfdWTEPMUVj4hLBUO1wJdffqk9os2bN/t7mJCNJA87+3y5adM2PQ+kWIWebbXsPORyUYtChUsa3BQLHG3XRv5n/y75cupU3xFLDSy3AR+V99XjbxFIhXQoG+t4RFwSDOBjUKA8Dnf//ffLwoUL/U+QszCu9lC5U6RX7mcaXH0bt+Oxguv9DBGCFPuJ+nWlo0UuGhaTAcg3YRvy3aRJExk3bpx+twBSxUMoIhji0kQC43c1bdpUg4b0Ms0HAegpYSpeydwpY9Nyd8e1+gK0ZrfjsUKgO+kxiBWAXObIRsuZb7l1g76DDaDaZuD6xhtv1HAO7wOhHOKdXCBuFcwOzCILPaV3331Xt4laQzjQu2wF6V+mvG7bQcYKj1IWILCzOAMdc8GKs5uqM0/eAHEuhn0IR/BIIM85mIkBHItXs2hHQhAMUKi0ZHyPV199VeM/tGCSj8/2cIXK8kjJ3I4u743Nxp+jS1+Aig8GrhCymp33MsTwHTvZsrk8LMfk6xkztNFAHBSa/GEemSTIq7IgW6IhYQgG8EHwzT755BPtQfGaAswlfgqVwjKwYWO5d3/ON6YBPcwsX8woqu3dSRo7Av3P5fzDbVrLfVvWy/ylS7U3iBNPQyIEgZ/58ssvq3sA2eIlOh8JEopgAJJR0IsXL5bu3bvLihUr9Ditm9ZPBT1Ssar0Pumgk1XBZDUQySiAQMcjghvh7Mcd52xqfqF0mjVDiUUjIQ8QCUXmcbIPP/xQH4iN9ANU8YS4dfLdQAwIovDmY+Y6denSRSuGSgJUztA9O2Tocccbrm3kctIgbHJBEDfYSWSHjVD2tvzT6Y2k43fTNN2oMkqMGwD4qgYqzYB1IpMLJJyC2UHSUS3MCH4ZKmD8MlDW2h5bt5G03et7N4YFTGa2VaGckYcu4ahQFDA5I10e2LjOPxRmesX0GHk4hmcWceYTwYkPhYQmGKDVowATJ05Uoq1cudIfeGSNov21Rh3pfjj3gyN+glndfesktsIGv8tvoU0qkyr/s2OLppm0YdJZYwrpJdJbNPO7kgEJTzBg4mMLFizQMUyCsuyTNdagT0Yl6VvC8SygT5lSLCJm+8xTMJgqD1RgdtLpqILlKzrx/rFD8tTRg6pWfB6PMUXIxVfMGBpjTYOBdMmChPPBAgHTQovnne4oGe93RyEAx9kevm+3DD64T4/54WtbkCtYK4M8hkBu59mPByLXByeOyDOWX0hjYIyVMAtEYprNRx99pF+TBZj4ZEJSKJgBPhiVRiXySiIeKtm2bZu/Y6DdfKvyX69ZT644mnuMiUIwChVN/F/pEtJr60a/KqFapIPxRKbZMF2c/0GsZDGLdiQVwQDZQbGoxGXLlqlCLF26VAOWRMaJgBPqIPo/IN3RQ/OZTCfMkUiqn1kQty9boiYQ8pAm0wD4xsA777yj89+U9BaSkVwgKUykHVQUlYjvxWs96e4zpQUQzjBKNurwAXnZ8odywZDLUdnshVP9nJN5eTu55Yz6cv28OUou7mfCD9yfl47wFBVpA6Q3WckFkk7BnDDBVyYxPvnkk/6gplG0VIsEr1atJTek5PV9KJhwqz7ltEaSvWadvgMNcP3t27erM5+Zmak+1tNPP60xLsISqChqmuxIeoKhIiwQbd26dfoO2ZkzZ6rCsfA/FK1H6bLyeFo536/yB8jFNZW4llk012/Xrp08//zz2kskHckUhgiFYqFgpjKpdD7cxTgmr/nE4QYUAf9D2Z6oVU96HncUCb8PUEwlateWrC1b5OJSJ2X37hzlQpkMgQiW4sTjzKNaxpkvTkh6ggF8INN7Y2Ewed68eRo132IRBJhigBxZFtEmnXamnLlnrx6zg7Oga1aj+vJAtYoyZcoUHc4xsx9w5rkXoQimFl166aWqZKSBaxc3FAuCOYFSETtjoHzEiBEaO4MUkAPlYZ1mrUfVqu8PZ0CqlAb1JGvDRt3vWLW8rFq1SknFb/kdCwS+9dZbZcCAAfp8IihuqmVHsSQYQHFQFszWBx98oC9nw1/iOOYMQEQAYYZ9+71uAz7ciRqhSiyQijVvsMGRxyxCKo5xD2OiiyOKJcHIsjGZbEMCYmY8Ff3tt9/6yWeUB6LwWnai70xlNioHyYz5o3eIr3Xeeefp/7h2cScXKLYKZkgGCSCD2WbG7MiRI3UEAIIZgqBmJqwAgVA+eosNGjSQv/zlL/psopnPxbWdxAp0rDig2BLMwGQfFYIcEI2neQhn4MAbMweh+J9Zc4zPr/CCYx7CgDx2QtrBPUw4pLih2BPMDkhAcUAEgqOMAjCeSU/T/r/atWurz3bLLbdoQBXl8hAYHsEcoDhQIdY7duzQY3fffbfMmjVLj1911VX6vlMceuOjFUfTFy48ggUBqkXgFDPJi4tRKghmHhnziBUaHsFCgOLBqcfngnBufpaHwPAI5gPkMQQKBIqJBaJ5CB8ewTzEFF5z9BBTeATzEFN4BPMQQ4j8P5lAR6BZmogEAAAAAElFTkSuQmCC";
												var imLikeButtonHtml = imgLikeButtonOff;
												
												if(result[i].likes_list != "")
												{
													if(result[i].likes_list.includes(","))
													{
														arrayProfili = result[i].likes_list.split(",");
														
														for( var j = 0; j < arrayProfili.length; j++)
														{
															 if(arrayProfili[j].localeCompare(params.username) == 0)
															 {
																 listaProfili += timelinePage + arrayProfili[j] + "</a>  ";	
																 imLikeButtonHtml = imgLikeButtonOn;
															 }
															 else
																 listaProfili += profilePage + arrayProfili[j] + "\">" + arrayProfili[j] + "</a>  ";	
														}
														
														
													}
													else
														if( result[i].likes_list.localeCompare(params.username) == 0)
														{   
															imLikeButtonHtml = imgLikeButtonOn;
															listaProfili += timelinePage + result[i].likes_list + "</a>  "	
														}												
														else
															listaProfili += profilePage + result[i].likes_list + "\">" + result[i].likes_list + "</a>  "						
												}
												
												
												if(result[i].cnt != 0)
													 testoLike = 'Piace a ' + result[i].cnt + ' persone'
																						
												 resultPage +='<div id="' + loopPid + '">'
															//+ '<a href="#" onClick="confirmDelete(\'' + loopPid + '\')"> <h4>Cancella Post</h4></a>'
															+ '<a href="#" onClick="if (confirm(\'Vuoi davvero cancellare il post?\') == true) { window.location.href = \'DELETE_POST?username=' + params.username + '&pid=' + loopPid + '\'}"> <h4>Cancella Post</h4></a>'
															+ '<div>'
															+ '		<img src="' + imgSrc + '" width="600" height="600">'
															+ '		 <div> '
															+ '			   <a href="ADD_LIKE?username=' + params.username +'&pid=' + loopPid + '&r=0"><img src="' + imLikeButtonHtml + '" class = "spacing" alt="like"  width="20" height="20" /></a>'
															+ '			   <input type=button value="' + testoLike + '" onClick="showElement(\'likesPost' + loopPid + '\')" >'
															+ '			   <div id="likesPost' + loopPid + '" hidden style="position:relative; left: 20;">	Piace a ' + listaProfili + ' </div>'
															+ '		</div>'
															+ '	</div>'
															+ '	</br>'
															+ ' <div id="mainDescr' + loopPid + '">DESCRIZIONE: ' + description + '</div>'
															+ ' </div>'
															+ ' <hr size="4" width="375" align="left" noshade/>'
											}
											
											if( result.length != 0 )
											{
											
												//bottoni anche a fine pagina
												resultPage += '	PLACEHOLDER_PREV' + '	PLACEHOLDER_NEXT';
												
												//usare pid per paginare il risultato ai prossimi 9 risultati
												
												//serve l'ultimo pid del result set anche se ho esaurito il for
												//i = (i == result.length || i == 9 ? i-1 : i)
												i--;
												
												//nel caso post_id sia stato settato a un massimo fittizio, viene posto come massimo il pid del primo elemento del risultato della query
												post_id = ( post_id == Number.MAX_SAFE_INTEGER ? result[i].max_pid : result[0].post_id);
																			
												//console.log(result[i].min_pid + " "+ result[i].max_pid +" "+post_id+" "+result[0].post_id)
												
												//post precedenti hano id superiore -> bottone next non compare se non ci sono post con id maggiore sul db rispetto a quello considerato
												var btnPrev = ( result[i].max_pid == post_id ? "" : '<input type=button value="<<" onClick="window.location.href=\'TIMELINE?username=' + params.username + '&pid=' + post_id + '&b=1\'">');
					
												//post successivihanno id inferiore -> specularmente non posso visualizzare pagine successive se non ci sono post di id inferiore rispetto all'ultimo considerato -> result[i]
												var btnNext = ( result[i].min_pid == result[i].post_id ? "" :'<input type=button value=">>" onClick="window.location.href=\'TIMELINE?username=' + params.username + '&pid=' + result[i].post_id + '&b=0\'">');
												
												resultPage = resultPage.replace("PLACEHOLDER_PREV", btnPrev).replace("PLACEHOLDER_PREV", btnPrev);
												resultPage = resultPage.replace("PLACEHOLDER_NEXT", btnNext).replace("PLACEHOLDER_NEXT", btnNext);
												
												resultPage += '   <input type=button value="^" onClick="window.scrollTo(0, 0);">';
											}
											else 
											{
												resultPage += '<h2> Nessun post </h2>';
												resultPage = resultPage.replace("PLACEHOLDER_PREV", "").replace("PLACEHOLDER_PREV", "");
												resultPage = resultPage.replace("PLACEHOLDER_NEXT", "").replace("PLACEHOLDER_NEXT", "");
											}

											resultPage += '</body></html>';
										
											//risultato promise
											resolve
											({
												headers: {
												  'Content-Type': 'text/html'
												},
												statusCode: 200,
												body : resultPage
											})
								}) // fine costruzione pagina
			}
		}) // fine check sessione
	})
}					

